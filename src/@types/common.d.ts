import type mermaid from 'mermaid';

type Callback = (exposed: {
    run: typeof mermaid.run;
    initialize: typeof mermaid.initialize;
}) => void;

declare global {
    declare var PACKAGE: string;

    interface Window {
        mermaidJsonp: Callback[];
    }
}