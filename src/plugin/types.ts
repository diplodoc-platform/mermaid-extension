export type PluginOptions = {
    runtime: string;
    classes: string;
    bundle: boolean;
    onBundle?: (env: {bundled: Set<string>}, output: string, runtime: string) => void;
};
