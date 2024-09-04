import type {ZoomOptions} from '../types';

import * as d3 from 'd3';

import {attachKeyboard, attachMenu} from './zoom-control';
import './zoom.scss';

const DATA_MERMAID_ZOOM = 'mermaidZoom';

function datakey(key: string) {
    return key.replace(/^(.)/, (_, $1) => $1.toUpperCase());
}

function set(dataset: DOMStringMap, key: string, value: unknown) {
    dataset[DATA_MERMAID_ZOOM + datakey(key)] = String(value);
}

function get(dataset: DOMStringMap, key: string) {
    return dataset[DATA_MERMAID_ZOOM + datakey(key)];
}

const createInteraction = (svg: Element): HTMLElement => {
    const interaction = document.createElement('div');
    const {width, height} = svg.getBoundingClientRect();
    const style = `top: 0; left: 0; width: ${width}px; height: ${height}px; position: absolute; pointer-events: none;`;

    interaction.innerHTML = `<div class="mermaid-zoom-interaction" style="${style}"></div>`;

    return interaction.firstElementChild as HTMLElement;
};

const enableZoom = (element: HTMLElement, options: ZoomOptions) => {
    const svg = element.querySelector('svg') as SVGSVGElement;
    const {maximumScale} = options;
    const dispose: Function[] = [];

    const $svg = d3.select<SVGSVGElement, unknown>(svg);

    if (!svg.querySelector('g.zoom-layer')) {
        const layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        layer.setAttribute('class', 'zoom-layer');
        Array.from(svg.childNodes).forEach((child) => {
            layer.appendChild(child);
        });
        svg.appendChild(layer);
    }

    const $inner = $svg.select<SVGGElement>('g.zoom-layer');
    const interaction = createInteraction(svg);

    const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .on('zoom', (event: ZoomEvent) => $inner.attr('transform', String(event.transform)))
        .scaleExtent([1, maximumScale]);

    $svg.call(zoom);
    dispose.push(() => $svg.on('.zoom', null));

    if (options.resetOnBlur) {
        dispose.push(() => {
            $svg.call(zoom.transform, d3.zoomIdentity);
        });
    }

    if (options.showMenu) {
        dispose.push(attachMenu(interaction, $svg, $inner, zoom));
    }

    if (options.bindKeys) {
        dispose.push(attachKeyboard($svg, $inner, zoom));
    }

    element.appendChild(interaction);
    dispose.push(() => element.removeChild(interaction));

    return () => dispose.forEach((action) => action());
};

function getZoomable(element: HTMLElement) {
    return element.closest('[data-mermaid-zoom-allowed="1"]') as HTMLElement | null;
}

function getZoomableSvg(element: HTMLElement) {
    return element.closest('[data-mermaid-zoom-allowed="1"] > svg') as HTMLElement | null;
}

function getActiveSvg(element: HTMLElement) {
    return element.closest('[data-mermaid-zoom-enabled="1"] > svg') as HTMLElement | null;
}

function getActiveInteraction(element: HTMLElement) {
    return element.closest(
        '[data-mermaid-zoom-enabled="1"] > .mermaid-zoom-interaction',
    ) as HTMLElement | null;
}

function setZoomable(element: HTMLElement, value: string) {
    set(element.dataset, 'allowed', value);
}

function isZoomEnabled(element: HTMLElement) {
    return get(element.dataset, 'enabled') === '1';
}

function setZoomEnabled(element: HTMLElement, value: string) {
    set(element.dataset, 'enabled', value);
}

export function zoomBehavior(event: Event) {
    const element = getZoomable(event.target as HTMLElement);
    const svg = getZoomableSvg(event.target as HTMLElement);

    if (!element || !svg || isZoomEnabled(element as HTMLElement)) {
        return;
    }

    setZoomEnabled(element, '1');

    const options = getZoomOptions(element);
    const disableZoom = enableZoom(element, options);
    const onOuterClick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (!getActiveSvg(target) && !getActiveInteraction(target)) {
            disableZoom();
            setZoomEnabled(element, '0');
            document.removeEventListener('mousedown', onOuterClick, true);
        }
    };

    document.addEventListener('mousedown', onOuterClick, true);
}

function getZoomOptions(element: HTMLElement): ZoomOptions {
    return {
        maximumScale: Number(get(element.dataset, 'maximumScale')),
        resetOnBlur: get(element.dataset, 'resetOnBlur') === 'true',
        showMenu: get(element.dataset, 'showMenu') === 'true',
        bindKeys: get(element.dataset, 'bindKeys') === 'true',
    };
}

export function bindZoomOptions(element: HTMLElement, options: Partial<ZoomOptions> | boolean) {
    const _options: ZoomOptions = Object.assign(
        {
            maximumScale: 5,
            resetOnBlur: false,
            showMenu: false,
            bindKeys: false,
        },
        options,
    );

    if (options === false) {
        setZoomable(element, '0');
        setZoomEnabled(element, '0');
        return;
    }

    setZoomable(element, '1');

    for (const key of Object.keys(_options)) {
        set(element.dataset, key, _options[key as keyof typeof _options]);
    }
}
