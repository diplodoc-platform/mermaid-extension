import {coverageConfigDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: false,
        include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
        exclude: ['node_modules', 'build'],
        snapshotFormat: {
            escapeString: true,
            printBasicPrototype: true,
        },
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            exclude: ['test/**', ...coverageConfigDefaults.exclude],
            reporter: ['text', 'json', 'html', 'lcov'],
        },
    },
});
