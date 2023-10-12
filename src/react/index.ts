import type {InitConfig, RunOptions} from '../types';
import {useEffect, useState, useCallback} from 'react';

export type RuntimeOptions = {
    onError?: (error: any) => void;
};

function pick<
    O extends Record<string, any>,
    P extends string,
    R extends {
        [K in P]: O[K];
    },
>(object: O, props: readonly P[]): R {
    return Object.keys(object).reduce(
        (acc, key) => {
            if ((props as readonly string[]).includes(key)) {
                acc[key] = object[key];
            }

            return acc;
        },
        {} as Record<string, any>,
    ) as R;
}

function omit<
    O extends Record<string, any>,
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
        {} as Record<string, any>,
    ) as R;
}

export function MermaidRuntime(props: InitConfig & RunOptions & RuntimeOptions) {
    const renderMermaid = useMermaid();
    const config = omit(props, ['querySelector', 'nodes', 'onError']);
    const options = pick(props, ['querySelector', 'nodes']);

    useEffect(() => {
        renderMermaid(config, options).catch(props.onError || (() => {}));
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
