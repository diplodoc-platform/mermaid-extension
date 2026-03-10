// @vitest-environment jsdom

import type {ExposedAPI} from '../src/types';

import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';

const mockRender = vi.fn();

vi.mock('mermaid', () => ({
    default: {
        initialize: vi.fn(),
        mermaidAPI: {
            getConfig: () => ({zoom: false}),
        },
        render: mockRender,
    },
}));

vi.mock('../src/runtime/zoom', () => ({
    bindZoomOptions: vi.fn(),
    zoomBehavior: vi.fn(),
}));

const content =
    'sequenceDiagram%0A%09Alice-%3E%3EBob%3A%20Hi%20Bob%0A%09Bob-%3E%3EAlice%3A%20Hi%20Alice';

describe('Mermaid extension – runtime run()', () => {
    let api: ExposedAPI;

    beforeAll(async () => {
        const apiPromise = new Promise<ExposedAPI>((resolve) => {
            (window as any).mermaidJsonp = [
                (a: ExposedAPI) => {
                    resolve(a);
                },
            ];
        });
        await import('../src/runtime/index');
        api = await apiPromise;
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        mockRender.mockReset();
    });

    it('should render svg into element with valid data-content', async () => {
        document.body.innerHTML = `<div class="mermaid" data-content="${content}"></div>`;

        mockRender.mockResolvedValue({
            svg: '<svg xmlns="http://www.w3.org/2000/svg"><g><rect /></g></svg>',
        });

        await api.run();

        const div = document.querySelector('.mermaid')!;
        const svg = div.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg!.children.length).toBeGreaterThan(0);
    });

    it('should continue rendering remaining elements when one fails', async () => {
        document.body.innerHTML = `
            <div class="mermaid" id="first"></div>
            <div class="mermaid" id="second" data-content="${content}"></div>
        `;

        mockRender.mockRejectedValueOnce(new Error('Parse error')).mockResolvedValueOnce({
            svg: '<svg xmlns="http://www.w3.org/2000/svg"><g><rect /></g></svg>',
        });

        await api.run();

        const second = document.getElementById('second')!;
        const svg = second.querySelector('svg');
        expect(svg).toBeTruthy();
        expect(svg!.children.length).toBeGreaterThan(0);
    });
});
