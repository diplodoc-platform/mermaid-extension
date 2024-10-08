#!/usr/bin/env node

const esbuild = require('esbuild');
const {inlineScss} = require('esbuild-inline-sass');

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

esbuild.build({
    ...common,
    entryPoints: ['src/runtime/index.ts'],
    outfile: 'build/runtime/index.js',
    minify: true,
    loader: {
        '.svg': 'text',
    },
    plugins: [inlineScss()],
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
