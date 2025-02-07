import type {ExposedAPI, InitConfig} from '../types';

import mermaid, {MermaidConfig} from 'mermaid';
import dedent from 'ts-dedent';

import {bindZoomOptions, zoomBehavior} from './zoom';

const DEFAULT_MERMAID_CONFIG: MermaidConfig = {
    startOnLoad: false,
    // To avoid breaking changes after updating to https://github.com/mermaid-js/mermaid/releases/tag/v11.0.0
    gitGraph: {useMaxWidth: false},
    sankey: {useMaxWidth: false},
    theme: 'forest',
};

mermaid.initialize(DEFAULT_MERMAID_CONFIG);

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
                    ...DEFAULT_MERMAID_CONFIG,
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
