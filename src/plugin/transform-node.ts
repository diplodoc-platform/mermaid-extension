import {copyFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';

import {transform as baseTransform} from './transform';
import {PluginOptions} from './types';

function copy(from: string, to: string) {
    mkdirSync(dirname(to), {recursive: true});
    copyFileSync(from, to);
}

const onBundle = (env: {bundled: Set<string>}, output: string, runtime: string) => {
    const file = join(PACKAGE, 'runtime');
    if (!env.bundled.has(file)) {
        env.bundled.add(file);

        copy(require.resolve(file), join(output, runtime));
    }
};

export const transform = (options: Partial<Omit<PluginOptions, 'onBundle'>>) => {
    return baseTransform({...options, onBundle});
};
