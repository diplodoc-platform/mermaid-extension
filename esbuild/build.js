#!/usr/bin/env node

const {build, sassPlugin} = require('@diplodoc/lint/esbuild');

const {
    compilerOptions: {target},
} = require('../tsconfig.json');

const common = {
    bundle: true,
    sourcemap: true,
    target: target,
    tsconfig: './tsconfig.json',
    plugins: [sassPlugin()],
};

const commonPlugin = {
    external: ['markdown-it', 'node:*'],
    define: {
        PACKAGE: JSON.stringify(require('../package.json').name),
    },
};

const commonRuntime = {
    entryPoints: ['src/runtime/index.ts'],
    loader: {
        '.svg': 'text',
    },
};

build({
    ...common,
    ...commonRuntime,
    outfile: 'build/runtime/index-node.js',
    platform: 'node',
    minify: true,
});

build({
    ...common,
    ...commonRuntime,
    external: ['d3', 'mermaid', 'ts-dedent'],
    outfile: 'build/runtime/index.js',
    platform: 'neutral',
});

build({
    ...common,
    entryPoints: ['src/runtime/zoom.scss'],
    outfile: 'build/styles/zoom.css',
});

build({
    ...common,
    entryPoints: ['src/react/index.ts'],
    outfile: 'build/react/index.js',
    platform: 'neutral',
    external: ['react'],
});

build({
    ...common,
    ...commonPlugin,
    entryPoints: ['src/plugin/index-node.ts'],
    outfile: 'build/plugin/index-node.js',
    platform: 'node',
});

build({
    ...common,
    ...commonPlugin,
    entryPoints: ['src/plugin/index.ts'],
    outfile: 'build/plugin/index.js',
    platform: 'neutral',
});
