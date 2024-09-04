import type {InitConfig, RunOptions} from '../types';

import {useCallback, useEffect, useState} from 'react';

export type RuntimeOptions = {
    onError?: (error: unknown) => void;
};

function pick<
    O extends Hash,
    P extends string,
    R extends {
        [K in P]: O[K];
    },
>(object: O, props: readonly P[]): R {
    return Object.keys(object).reduce((acc, key) => {
        if ((props as readonly string[]).includes(key)) {
            acc[key] = object[key];
        }

        return acc;
    }, {} as Hash) as R;
}

function omit<
    O extends Hash,
    P extends string,
    R extends {
        [K in keyof Omit<O, P>]: O[K];
    },
>(object: O, props: readonly P[]): R {
    return Object.keys(object).reduce(
        (acc, key) => {
            if (!(props as readonly string[]).includes(key)) {
                acc[key] = object[key];
            }

            return acc;
        },
        {} as Record<string, unknown>,
    ) as R;
}

export function MermaidRuntime(props: InitConfig & RunOptions & RuntimeOptions) {
    const renderMermaid = useMermaid();
    const config = omit(props as Hash, ['querySelector', 'nodes', 'onError']);
    const options = pick(props as Hash, ['querySelector', 'nodes']);

    useEffect(() => {
        renderMermaid(config, options as Hash).catch(props.onError || (() => {}));
    });

    return null;
}

export function useMermaid() {
    const [mermaid, setMermaid] = useState<Parameters<Callback>[0] | null>(null);
    const render = useCallback(
        async (config: InitConfig, options?: RunOptions) => {
            if (mermaid) {
                mermaid.initialize(config);
                return mermaid.run(options);
            }
        },
        [mermaid],
    );

    useEffect(() => {
        (window.mermaidJsonp = window.mermaidJsonp || []).push(setMermaid);

        return () => {
            const index = window.mermaidJsonp.indexOf(setMermaid);
            if (index > -1) {
                window.mermaidJsonp.splice(index, 1);
            }
        };
    }, []);

    return render;
}
