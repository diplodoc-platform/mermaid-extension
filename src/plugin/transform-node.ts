import {transform as baseTransform} from './transform';
import {PluginOptions} from './types';

function copy(from: string, to: string) {
    const {mkdirSync, copyFileSync} = dynrequire('node:fs');
    const {dirname} = dynrequire('node:path');

    mkdirSync(dirname(to), {recursive: true});
    copyFileSync(from, to);
}

/*
 * Runtime require hidden for builders.
 * Used for nodejs api
 */
export function dynrequire(module: string) {
    // eslint-disable-next-line no-eval
    return eval(`require('${module}')`);
}

const onBundle = (env: {bundled: Set<string>}, output: string, runtime: string) => {
    const {join} = dynrequire('node:path');
    const file = join(PACKAGE, 'runtime');
    if (!env.bundled.has(file)) {
        env.bundled.add(file);

        copy(require.resolve(file), join(output, runtime));
    }
};

export const transform = (options: Partial<Omit<PluginOptions, 'onBundle'>>) => {
    return baseTransform({...options, onBundle});
};
