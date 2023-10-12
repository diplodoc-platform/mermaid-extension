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

esbuild.build({
    ...common,
    entryPoints: ['src/runtime/index.ts'],
    outfile: 'runtime/index.js',
    minify: true,
    loader: {
        '.svg': 'text',
    },
    plugins: [inlineScss()],
});

esbuild.build({
    ...common,
    entryPoints: ['src/react/index.ts'],
    outfile: 'react/index.js',
    platform: 'neutral',
    external: ['react'],
});

esbuild.build({
    ...common,
    entryPoints: ['src/plugin/index.ts'],
    outfile: 'plugin/index.js',
    platform: 'node',
    external: ['markdown-it', 'node:*'],
    define: {
        PACKAGE: JSON.stringify(require('../package.json').name),
    },
});
