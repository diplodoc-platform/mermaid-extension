import type mermaid, {RunOptions as MermaidRunOptions} from 'mermaid';

type RunOptions = Pick<MermaidRunOptions, 'querySelector' | 'nodes'>;

type Callback = (exposed: {
    run: (options?: RunOptions) => Promise<void>;
    initialize: typeof mermaid.initialize;
}) => void;

declare global {
    declare var PACKAGE: string;

    interface Window {
        mermaidJsonp: Callback[];
    }
}