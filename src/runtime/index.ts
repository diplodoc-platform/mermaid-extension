import type {ExposedAPI, InitConfig} from '../types';
import type {MermaidConfig} from 'mermaid';
// eslint-disable-next-line no-duplicate-imports
import mermaid from 'mermaid';
import dedent from 'ts-dedent';
import {bindZoomOptions, zoomBehavior} from './zoom';

mermaid.initialize({
    startOnLoad: false,
    theme: 'forest',
});

const jsonp = (window.mermaidJsonp = window.mermaidJsonp || []);
const queue = jsonp.splice(0, jsonp.length);

jsonp.push = function (...args) {
    args.forEach((callback) => {
        queue.push(callback);
        unqueue();
    });

    return queue.length;
};

let processing = false;

function unqueue() {
    if (!processing) {
        next();
    }
}

async function next(): Promise<void> {
    processing = true;

    const callback = queue.shift();
    if (callback) {
        await callback({
            run: async ({querySelector = '.mermaid', nodes} = {}) => {
                const nodesList: Element[] = Array.from(
                    nodes || document.querySelectorAll(querySelector),
                );
                const {zoom = false} = mermaid.mermaidAPI.getConfig() as InitConfig;

                for (const element of nodesList) {
                    const id = `mermaid-${Date.now()}`;
                    const content = decodeURIComponent(element.getAttribute('data-content') || '');
                    let dedentedContent = dedent(content);

                    if (content.replace(/\n*$/, '').endsWith(' ')) {
                        dedentedContent += ' ';
                    }
                    const text = dedentedContent.trimStart().replace(/<br\s*\/?>/gi, '<br/>');

                    const {svg, bindFunctions} = await mermaid.render(id, text, element);
                    element.innerHTML = svg;

                    if (bindFunctions) {
                        bindFunctions(element);
                    }

                    bindZoomOptions(element as HTMLElement, zoom);
                }
            },
            initialize: (config) => {
                mermaid.initialize({
                    startOnLoad: false,
                    ...(config as MermaidConfig),
                });

                const {zoom} = mermaid.mermaidAPI.getConfig() as InitConfig;

                document.removeEventListener('click', zoomBehavior);
                if (zoom) {
                    document.addEventListener('click', zoomBehavior);
                }
            },
            render: mermaid.render,
            parseError: mermaid.parseError,
            parse: mermaid.parse,
            setParseErrorHandler: mermaid.setParseErrorHandler,
        } as ExposedAPI);

        return next();
    }

    processing = false;
}

unqueue();
