import type mermaid from 'mermaid';
// eslint-disable-next-line no-duplicate-imports
import type {MermaidConfig, RunOptions as MermaidRunOptions} from 'mermaid';

export type RunOptions = Pick<MermaidRunOptions, 'querySelector' | 'nodes'>;

export type InitConfig = MermaidConfig & {
    /**
     * Enable diagram *zoom and explore* feature. Can be boolean or object with inner props.
     */
    zoom?: boolean | Partial<ZoomOptions>;
};

export type ExposedAPI = {
    run: (options?: RunOptions) => Promise<void>;
    initialize: (config: InitConfig) => ReturnType<typeof mermaid.initialize>;
    render: typeof mermaid.render;
    parseError: typeof mermaid.parseError;
    parse: typeof mermaid.parse;
    setParseErrorHandler: typeof mermaid.setParseErrorHandler;
};

export type ZoomOptions = {
    /**
     * Maximum zoom scale.
     * @default 5
     */
    maximumScale: number;
    /**
     * Reeset diagram position on outher click.
     * @default false
     */
    resetOnBlur: boolean;
    /**
     * Show navigation menu.
     * @default false
     */
    showMenu: boolean;
    /**
     * Enable `wasd` controls.
     * Use `w/a/s/d` to explore diagram, `e/q` to zoom in/out and `r` to reset diagram position
     * @default false
     */
    bindKeys: boolean;
};
