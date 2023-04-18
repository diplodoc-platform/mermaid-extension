# Diplodoc Mermaid extension

This is extension for Diplodoc platform which adds support for Mermaid diagrams.

Extension contains some parts:
- [Prepared Mermaid runtime](#prepared-mermaid-runtime)
- [MarkdownIt transform plugin](#markdownit-transform-plugin)
- [React hook for smart control of Mermaid](#react-hook-for-smart-control-of-mermaid)

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

## MarkdownIt transform plugin

Plugin for [@diplodoc/transform](https://github.com/diplodoc-platform/transform) package.

Configuration:
- `runtime` - name on runtime script which will be exposed in results `script` section.<br>
  (Default: `_assets/mermaid-extension.js`)<br>

- `bundle` - boolean flag to enable/disable copying of bundled runtime to target directory.<br>
  Where target directore is `<transformer output option>/<plugin runtime option>`<br>
  Default: true<br>

- `classes` - additional classes which will be added to Mermaid's diagrams.<br>
  Example: `my-own-class and-other-class`<br>

## React hook for smart control of Mermaid

Simplifies Mermaid control with react

```ts
import React, { useEffect } from 'react'
import { useMermaid } from '@diplodoc/mermaid-extension/hooks'

export const App: React.FC = ({ theme }) => {
    const renderMermaid = useMermaid()

    useEffect(() => {
      renderMermaid({ theme })
    }, [ theme, renderMermaid ])
}
```