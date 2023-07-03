import type mermaid, {RunOptions as MermaidRunOptions} from 'mermaid';

type RunOptions = Pick<MermaidRunOptions, 'querySelector' | 'nodes'>;

type Callback = (exposed: {
    run: (options?: RunOptions) => Promise<void>;
    initialize: typeof mermaid.initialize;
    render: typeof mermaid.render;
    parseError: typeof mermaid.parseError,
    parse: typeof mermaid.parse,
    setParseErrorHandler: typeof mermaid.setParseErrorHandler
}) => void;

declare global {
    declare var PACKAGE: string;

    interface Window {
        mermaidJsonp: Callback[];
    }
}