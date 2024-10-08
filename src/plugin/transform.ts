import type {
    MarkdownItPluginCb,
    MarkdownItPluginOpts,
} from '@diplodoc/transform/lib/plugins/typings';
import type ParserCore from 'markdown-it/lib/parser_core';
import type Token from 'markdown-it/lib/token';

import MarkdownIt from 'markdown-it';

import {PluginOptions} from './types';

function isMermaidBlock(token: Token) {
    return token.type === 'fence' && token.info.match(/^\s*mermaid(\s*|$)/);
}

function hidden<B extends Record<string | symbol, unknown>, F extends string | symbol, V>(
    box: B,
    field: F,
    value: V,
) {
    if (!(field in box)) {
        Object.defineProperty(box, field, {
            enumerable: false,
            value: value,
        });
    }

    return box as B & {[P in F]: V};
}

const registerTransforms = (
    md: MarkdownIt,
    {
        classes,
        runtime,
        onBundle,
        bundle,
        output,
        updateTokens,
    }: PluginOptions & {
        output: string;
        updateTokens: boolean;
    },
) => {
    const applyTransforms: ParserCore.RuleCore = ({tokens, env}) => {
        hidden(env, 'bundled', new Set<string>());

        const blocks = tokens.filter(isMermaidBlock);

        if (updateTokens && blocks.length) {
            blocks.forEach((token) => {
                token.type = 'mermaid';
                token.attrSet('class', `mermaid ${classes}`);
            });
        }

        if (blocks.length) {
            env.meta = env.meta || {};
            env.meta.script = env.meta.script || [];
            env.meta.script.push(runtime);

            if (bundle && onBundle) {
                onBundle(env, output, runtime);
            }
        }
    };

    try {
        md.core.ruler.after('fence', 'mermaid', applyTransforms);
    } catch (e) {
        md.core.ruler.push('mermaid', applyTransforms);
    }
};

type InputOptions = MarkdownItPluginOpts & {
    destRoot: string;
};

export function transform(options: Partial<PluginOptions> = {}) {
    const {
        runtime = '_assets/mermaid-extension.js',
        classes = 'yfm-mermaid',
        bundle = true,
    } = options;

    const plugin: MarkdownItPluginCb<{output: string}> = function (md: MarkdownIt, {output = '.'}) {
        registerTransforms(md, {
            classes,
            runtime,
            bundle,
            output,
            updateTokens: true,
        });

        md.renderer.rules.mermaid = (tokens, idx) => {
            const token = tokens[idx];
            const code = encodeURIComponent(token.content.trimStart());

            return `<div class="mermaid" data-content="${code}"></div>`;
        };
    };

    Object.assign(plugin, {
        collect(input: string, {destRoot}: InputOptions) {
            const md = new MarkdownIt().use((md: MarkdownIt) => {
                registerTransforms(md, {
                    classes,
                    runtime,
                    bundle,
                    output: destRoot,
                    updateTokens: false,
                });
            });

            md.parse(input, {});
        },
    });

    return plugin;
}
