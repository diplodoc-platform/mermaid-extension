import MarkdownIt from 'markdown-it';
import {describe, expect, it} from 'vitest';

import {transform as mermaidTransform} from '../src/plugin/transform';

function html(markup: string, opts?: Parameters<typeof mermaidTransform>[0]) {
    const md = new MarkdownIt();
    md.use(mermaidTransform({bundle: false, ...opts}), {output: '.'});
    return md.render(markup);
}

function meta(markup: string, opts?: Parameters<typeof mermaidTransform>[0]) {
    const md = new MarkdownIt();
    md.use(mermaidTransform({bundle: false, ...opts}), {output: '.'});
    const env: {meta?: {script?: string[]}} = {};
    md.render(markup, env);
    return env.meta;
}

function tokens(markup: string, opts?: Parameters<typeof mermaidTransform>[0]) {
    const md = new MarkdownIt();
    md.use(mermaidTransform({bundle: false, ...opts}), {output: '.'});
    return md.parse(markup, {});
}

describe('Mermaid extension – plugin', () => {
    it('should render mermaid fence block', () => {
        const result = html('```mermaid\ngraph TD\n  A-->B\n```');
        expect(result).toContain('<div class="mermaid"');
        expect(result).toContain('data-content="');
        expect(result).toContain('graph%20TD'); // encoded
        expect(result).toContain('A--%3EB');
        expect(result).toContain('</div>');
    });

    it('should render mermaid block with language hint (mermaid with spaces)', () => {
        const result = html('``` mermaid\ngraph LR\n  x-->y\n```');
        expect(result).toContain('<div class="mermaid"');
        expect(result).toContain('data-content="');
        expect(result).toContain('graph%20LR');
    });

    it('should not transform non-mermaid fence', () => {
        const result = html('```js\nconst x = 1;\n```');
        expect(result).not.toContain('class="mermaid"');
        expect(result).toContain('<pre>');
        expect(result).toContain('code');
    });

    it('should add default runtime to meta when mermaid block present', () => {
        expect(meta('```mermaid\ngraph TD\nA-->B\n```')).toStrictEqual({
            script: ['_assets/mermaid-extension.js'],
        });
    });

    it('should add custom runtime to meta', () => {
        expect(
            meta('```mermaid\ngraph TD\nA-->B\n```', {runtime: '/assets/mermaid.js'}),
        ).toStrictEqual({script: ['/assets/mermaid.js']});
    });

    it('should not add meta when no mermaid block', () => {
        expect(meta('```js\nfoo\n```')).toBeUndefined();
        expect(meta('plain paragraph')).toBeUndefined();
    });

    it('should transform fence token to mermaid type', () => {
        const toks = tokens('```mermaid\ngraph TD\nA-->B\n```');
        const mermaidToken = toks.find((t) => t.type === 'mermaid');
        expect(mermaidToken).toBeDefined();
        expect(mermaidToken!.content).toContain('graph TD');
        expect(mermaidToken!.attrGet('class')).toContain('yfm-mermaid');
    });

    it('should apply custom classes to token', () => {
        const toks = tokens('```mermaid\ngraph TD\nA-->B\n```', {
            classes: 'custom-mermaid',
        });
        const mermaidToken = toks.find((t) => t.type === 'mermaid');
        expect(mermaidToken!.attrGet('class')).toContain('custom-mermaid');
    });

    it('should trim start of content in data-content', () => {
        const result = html('```mermaid\n\n  graph TD\n  A-->B\n```');
        // content is encoded; leading newlines trimmed
        expect(result).toContain('data-content="');
        const match = result.match(/data-content="([^"]+)"/);
        expect(match).toBeTruthy();
        expect(decodeURIComponent(match![1])).toMatch(/^\s*graph TD/);
    });
});
