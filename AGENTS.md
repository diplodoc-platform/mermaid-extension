# AGENTS.md

This file contains instructions for AI agents working with the `@diplodoc/mermaid-extension` project.

## Common Rules and Standards

**Important**: This package follows common rules and standards defined in the Diplodoc metapackage. When working in metapackage mode, refer to:

- **`.agents/style-and-testing.md`** in the metapackage root for:
  - Code style guidelines
  - **Language requirements** (commit messages, comments, docs MUST be in English)
  - Commit message format (Conventional Commits)
  - Pre-commit hooks rules (**CRITICAL**: Never commit with `--no-verify`)
  - Testing standards
  - Documentation requirements
- **`.agents/core.md`** for core concepts
- **`.agents/monorepo.md`** for workspace and dependency management
- **`.agents/dev-infrastructure.md`** for build and CI/CD

**Note**: In standalone mode (when this package is used independently), these rules still apply. If you need to reference the full documentation, check the [Diplodoc metapackage repository](https://github.com/diplodoc-platform/diplodoc).

## Project Description

`@diplodoc/mermaid-extension` is a Diplodoc platform extension that adds support for Mermaid diagrams in documentation. It includes a MarkdownIt transform plugin, a prepared Mermaid runtime (async loading, `mermaidJsonp`), and a React component for controlling rendering and zoom.

**Key Features**:

- MarkdownIt transform plugin: converts ` ```mermaid ` fence blocks into `<div class="mermaid" data-content="...">` and registers runtime script in `env.meta.script`
- Prepared Mermaid runtime: disables `startOnLoad`, exposes `mermaidJsonp` callback, limits API to `initialize` and `run`; supports zoom/explore options
- React export: `MermaidRuntime` and hooks for loading runtime and controlling Mermaid
- Plugin options: `runtime`, `classes`, `bundle`, `onBundle`; plugin is used as `md.use(transform(options), { output: '.' })`

**Primary Use Case**: Render Mermaid diagrams in YFM/Diplodoc with deferred loading of the large Mermaid bundle and controllable init/run.

## Project Structure

### Main Directories

- `src/` — source code
  - `plugin/` — MarkdownIt transform plugin
    - `transform.ts` — plugin factory, core ruler, render rule for `mermaid` tokens
    - `types.ts` — `PluginOptions`
    - `index.ts` — exports `transform`
    - `index-node.ts` / `transform-node.ts` — Node-specific entry if any
  - `runtime/` — browser runtime
    - `index.ts` — runtime entry, Mermaid init and `mermaidJsonp`
    - `zoom.ts`, `zoom-control.ts` — zoom/explore feature
    - `zoom.scss` — zoom styles
  - `react/` — React component and hooks
    - `index.ts` — `MermaidRuntime` and hooks
  - `@types/` — global/svg type declarations
  - `types.ts` — shared types
- `test/` — test suite
  - `plugin.spec.ts` — Vitest tests for plugin (MarkdownIt + plugin only, no `@diplodoc/transform`)
- `build/` — compiled output (generated)
  - `plugin/`, `runtime/`, `react/`, `styles/`
- `esbuild/` — build configuration
  - `build.js` — esbuild script (plugin, runtime, styles)

### Configuration Files

- `package.json` — package metadata, scripts (`test`, `test:watch`, `test:coverage`), exports
- `tsconfig.json` — TypeScript config; `include`: `["src", "test"]`
- `vitest.config.mjs` — Vitest; `include`: `test/**/*.spec.ts`, `test/**/*.test.ts`
- `CHANGELOG.md` — change log (release-please)
- `CONTRIBUTING.md` — contribution guidelines (if present)

## Tech Stack

- **Language**: TypeScript
- **Build**: esbuild (via `@diplodoc/lint/esbuild`), tsc for declarations (`build:declarations`)
- **Testing**: Vitest
- **Styling**: SCSS (zoom), compiled to CSS
- **Dependencies**: `mermaid`, `d3`, `@gravity-ui/icons` (runtime/React)
- **Peer**: `markdown-it` ^13, `react` optional
- **Dev**: `@diplodoc/lint`, `@diplodoc/tsconfig`, `markdown-it`, `vitest`, `@vitest/coverage-v8`

## Usage Modes

### 1. As Part of Metapackage (Workspace Mode)

- Path: `extensions/mermaid/`
- Develop with other packages; workspace linking applies.

**Development**:

```bash
cd extensions/mermaid
npm install   # or from root
npm run build
npm test
npm run typecheck
npm run lint
```

### 2. Standalone Mode

- Install: `npm install @diplodoc/mermaid-extension`
- Use: `import mermaid from '@diplodoc/mermaid-extension'` (or `@diplodoc/mermaid-extension/plugin`), then `mermaid.transform({ bundle: false })` with MarkdownIt or `@diplodoc/transform`. Runtime: `@diplodoc/mermaid-extension/runtime`, React: `@diplodoc/mermaid-extension/react`.

## Package Exports

- **`.` / `./plugin`** — plugin: `{ transform }`; Node/default entries
- **`./runtime`** — runtime script (browser/node)
- **`./react`** / **`./hooks`** — React component and hooks
- **`./styles/*`** — built styles (e.g. zoom)

## Testing

- **Runner**: Vitest
- **Config**: `vitest.config.mjs` (node env, no globals)
- **Tests**: `test/**/*.spec.ts`, `test/**/*.test.ts`
- **Scope**: MarkdownIt + mermaid plugin only; no dependency on `@diplodoc/transform` in tests
- **Helpers**: `html(markup, opts?)`, `meta(markup, opts?)`, `tokens(markup, opts?)` in `test/plugin.spec.ts`

```bash
npm test
npm run test:watch
npm run test:coverage
```

## Linting and Code Quality

- Linting: `@diplodoc/lint` (ESLint, Prettier, Stylelint, etc.)
- Commands: `npm run lint`, `npm run lint:fix`
- Pre-commit: lint-staged and husky; do not commit with `--no-verify`.

## Documentation

- **README.md** — user-facing: Quickstart, Prepared Mermaid runtime, MarkdownIt plugin options, React hook and component
- **AGENTS.md** — this file; guide for AI agents

When adding or changing features, keep README and AGENTS.md in sync with the code (options, exports, test layout).
