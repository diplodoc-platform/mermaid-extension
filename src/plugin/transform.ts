import type {Env, MarkdownIt as MarkdownItParser, StateCore, Token} from 'markdown-it';
import type {PluginOptions} from './types';

import MarkdownIt from 'markdown-it';

type MermaidEnv = Env & {meta?: {script?: string[]}};

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

    return box as B & Record<F, V>;
}

const registerTransforms = (
    md: MarkdownItParser,
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
    const applyTransforms = ({tokens, env: parserEnv}: StateCore) => {
        const env = hidden(parserEnv as MermaidEnv, 'bundled', new Set<string>());

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
    } catch {
        md.core.ruler.push('mermaid', applyTransforms);
    }
};

type InputOptions = {
    destRoot: string;
};

export function transform(options: Partial<PluginOptions> = {}) {
    const {
        runtime = '_assets/mermaid-extension.js',
        classes = 'yfm-mermaid',
        bundle = true,
        onBundle,
    } = options;

    const plugin = function (md: MarkdownItParser, {output = '.'}: {output: string}) {
        registerTransforms(md, {
            classes,
            runtime,
            bundle,
            onBundle,
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
            const md = new MarkdownIt().use((md) => {
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
