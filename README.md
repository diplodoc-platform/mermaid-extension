# Diplodoc Mermaid extension

[![NPM version](https://img.shields.io/npm/v/@diplodoc/mermaid-extension.svg?style=flat)](https://www.npmjs.org/package/@diplodoc/mermaid-extension)

This is extension for Diplodoc platform which adds support for Mermaid diagrams.

Extension contains some parts:
- [Prepared Mermaid runtime](#prepared-mermaid-runtime)
- [MarkdownIt transform plugin](#markdownit-transform-plugin)
- [React hook_and_component for smart control of Mermaid](#react-hook-for-smart-control-of-mermaid)

## Quickstart

Attach plugin to transformer

```js
import mermaid from '@diplodoc/mermaid-extension';
import transform from '@diplodoc/transform';

const {result} = await transform(`
\`\`\`mermaid
graph TD
    A[Christmas] -->|Get money| B(Go shopping)
\`\`\`
`, {
    plugins: [
        mermaid.transform({ bundle: false })
    ]
});
```

Add mermaid runtime to your final page

```html
<html>
    <head>
        <!-- Read more about '_assets/mermaid-extension.js' in 'MarkdownIt transform plugin' section -->
        <script src="_assets/mermaid-extension.js" async />
    </head>
    <body style="background: #000">
        ${result.html}
        <script>
            // Read more about 'mermaidJsonp' in 'Prepared Mermaid runtime' section
            window.mermaidJsonp = window.mermaidJsonp || [];
            window.mermaidJsonp.push((mermaid) => {
                mermaid.initialize({ theme: 'dark' });
                mermaid.run();
            });
        </script>
    </body>
</html>
```

## Prepared Mermaid runtime

The problem with Mermaid is that it has big bundle size.
The most expected behavior is loading it asynchronously.
But if we want to disable Mermaid's `startOnLoad` option, then we don't know when the Mermaid will be initialized.

**Prepared Mermaid runtime** designed to solve this problem.
We disable Mermaid's `startOnLoad` option to precise control render step.
Then we add `mermaidJsonp` global callback to handle Mermaid's loading.

Also, we limit exposed Mermaid API by two methods:
- `initialize` - configure mermaid before next render
- `run` - start diagrams rendering

Usage example:
```js
window.mermaidJsonp = window.mermaidJsonp || [];

// This callback will be called when runtime is loaded
window.mermaidJsonp.push((mermaid) => {
    mermaid.initialize({ theme: 'dark' });
    mermaid.run();
});

// You can configure more that one callback
window.mermaidJsonp.push((mermaid) => {
    console.log('Render diagrams');
});
```

### Custom initialize options

Exposed `mermaid.initialize` method has extra configuration options:

- `zoom` - Enable diagram *zoom and explore* feature. Can be boolean or object with inner props.<br>
  (Default: false)<br>
  - `showMenu` - Show navigation menu.<br>
    (Default: false)
  - `bindKeys` - Enable `wasd` controls.<br>
    Use `w/a/s/d` to explore diagram, `e/q` to zoom in/out and `r` to reset diagram position.<br>
    (Default: false)
  - `maximumScale` - Maximum zoom scale.<br>
    (Default: 5)
  - `resetOnBlur` - Reeset diagram position on outher click.<br>
    (Default: false)

## MarkdownIt transform plugin

Plugin for [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package.

Configuration:
- `runtime` - name of runtime script which will be exposed in results `script` section.<br>
  (Default: `_assets/mermaid-extension.js`)<br>

- `bundle` - boolean flag to enable/disable copying of bundled runtime to target directory.<br>
  Where target directore is `<transformer output option>/<plugin runtime option>`<br>
  Default: true<br>

- `classes` - additional classes which will be added to Mermaid's diagrams.<br>
  Example: `my-own-class and-other-class`<br>

## React hook and component for smart control of Mermaid

Simplifies Mermaid control with react

```tsx
import React from 'react'
import { transform } from '@diplodoc/transform'
import mermaid from '@diplodoc/mermaid-extension/plugin'
import { MermaidRuntime } from '@diplodoc/mermaid-extension/react'

const MERMAID_RUNTIME = 'extension:mermaid';

const Doc: React.FC = ({ content }) => {
    const result = transform(content, {
      plugins: [
        // Initialize plugin for client/server rendering
        mermaid.transform({
          // Do not touch file system
          bundle: false,
          // Set custom runtime name for searching in result scripts
          runtime: MERMAID_RUNTIME
        })
      ]
    })

    // Load mermaid only if one or more diagram should be rendered
    if (result.script.includes(MERMAID_RUNTIME)) {
      // Load oversized mermaid runtime asyncronously
      import('@diplodoc/mermaid-extension/runtime')
    }

    return <div dangerouslySetInnerHTML={{ __html: result.html }} />
}

export const App: React.FC = ({ theme }) => {
    return <>
        <Doc content={`
            \`\`\`mermaid
            graph TD
                A[Christmas] -->|Get money| B(Go shopping)
                B --> C{Let me think}
            \`\`\`
        `}/>
        <MermaidRuntime
            zoom={{
              showMenu: true,
              bindKeys: true,
              resetOnBlur: true,
            }}
        />
    </>
}
```
