import type { MermaidConfig } from 'mermaid';
import { useEffect, useState, useCallback } from 'react';
import { Callback, RunOptions } from '../@types/common';

export function useMermaid() {
    const [ mermaid, setMermaid ] = useState<Parameters<Callback>[0] | null>(null);
    const render = useCallback(async (config: MermaidConfig, options?: RunOptions) => {
        if (mermaid) {
            mermaid.initialize(config);
            return mermaid.run(options);
        }
    }, [ mermaid ]);

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