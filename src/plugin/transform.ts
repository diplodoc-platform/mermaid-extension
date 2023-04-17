import type {MarkdownIt} from '@doc-tools/transform/lib/typings';
import type {MarkdownItPluginCb} from '@doc-tools/transform/lib/plugins/typings';
import type ParserCore from 'markdown-it/lib/parser_core';

export function transform({ runtime = '_assets/mermaid-plugin.js', bundle = true } = {}) {
    const replaceFence: ParserCore.RuleCore = function replaceFence({tokens, env}) {
        tokens.forEach((token)  => {
            if (token.type !== 'fence' || !token.info.match(/^\s*mermaid(\s*|$)/)) {
                return;
            }

            token.type = 'mermaid';
            token.attrSet('class', `mermaid yfm-mermaid`);

            env.meta = env.meta || {};
            env.meta.script = env.meta.script || [];

            if (env.meta.script.indexOf(runtime) === -1) {
                env.meta.script.push(runtime);

                if (bundle) {
                    env.meta.bundle = env.meta.bundle || [];
                    env.meta.bundle.push({
                        from: '@diplodoc/mermaid-plugin/dist/runtime.js',
                        to: runtime
                    });
                }
            }
        });
    };

    return function(md: MarkdownIt) {
        try {
            md.core.ruler.after('fence', 'mermaid', replaceFence);
        } catch (e) {
            md.core.ruler.push('mermaid', replaceFence);
        }

        md.renderer.rules.mermaid = (tokens, idx) => {
            const token = tokens[idx];
            const code = encodeURIComponent(token.content.trim());

            return `<div class="mermaid" data-content="${code}"></div>`;
        };
    } as MarkdownItPluginCb;
}