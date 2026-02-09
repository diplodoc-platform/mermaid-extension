#!/usr/bin/env node

const esbuild = require('@diplodoc/lint/esbuild');
const {inlineScss} = require('esbuild-inline-sass');
const {sassPlugin} = require('esbuild-sass-plugin');

const {
    compilerOptions: {target},
} = require('../tsconfig.json');

const common = {
    bundle: true,
    sourcemap: true,
    target: target,
    tsconfig: './tsconfig.json',
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
    plugins: [inlineScss()],
};

esbuild.build({
    ...common,
    ...commonRuntime,
    outfile: 'build/runtime/index-node.js',
    platform: 'node',
    minify: true,
});

esbuild.build({
    ...common,
    ...commonRuntime,
    external: ['d3', 'mermaid', 'ts-dedent'],
    outfile: 'build/runtime/index.js',
    platform: 'neutral',
});

esbuild.build({
    ...common,
    entryPoints: ['src/runtime/zoom.scss'],
    outfile: 'build/styles/zoom.css',
    plugins: [sassPlugin()],
});

esbuild.build({
    ...common,
    entryPoints: ['src/react/index.ts'],
    outfile: 'build/react/index.js',
    platform: 'neutral',
    external: ['react'],
});

esbuild.build({
    ...common,
    ...commonPlugin,
    entryPoints: ['src/plugin/index-node.ts'],
    outfile: 'build/plugin/index-node.js',
    platform: 'node',
});

esbuild.build({
    ...common,
    ...commonPlugin,
    entryPoints: ['src/plugin/index.ts'],
    outfile: 'build/plugin/index.js',
    platform: 'neutral',
});
