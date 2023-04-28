import mermaid from 'mermaid';
import dedent from 'ts-dedent';

mermaid.initialize({
    startOnLoad: false,
    theme: 'forest'
});

const jsonp = window.mermaidJsonp = window.mermaidJsonp || [];
const queue = jsonp.splice(0, jsonp.length);

jsonp.push = function(...args) {
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
            run: async ({ querySelector = '.mermaid', nodes } = {}) => {
                const nodesList = nodes || document.querySelectorAll(querySelector);

                for (const element of Array.from(nodesList)) {
                    const id = `mermaid-${ Date.now() }`;
                    const content = element.getAttribute('data-content') || '';
                    const text = dedent(decodeURIComponent(content))
                        .trim()
                        .replace(/<br\s*\/?>/gi, '<br/>');

                    const { svg, bindFunctions } = await mermaid.render(id, text, element);
                    element.innerHTML = svg;

                    if (bindFunctions) {
                        bindFunctions(element);
                    }
                }
            },
            initialize: (config) => {
                mermaid.initialize({
                    startOnLoad: false,
                    ...config
                });
            },
        });

        return next();
    }

    processing = false;
}

unqueue();