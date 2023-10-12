import transform from '@doc-tools/transform';
import mermaid from '@diplodoc/mermaid-extension';
import {readFile} from 'node:fs/promises';

(async () => {
    const content = await readFile('./Readme.md', 'utf8');
    const {result} = await transform(content, {
        output: './build',
        plugins: [mermaid.transform()],
    });

    const scripts = result.meta.script
        .map((script) => {
            return `<script src="${script}"></script>`;
        })
        .join('\n');

    const html = `
<html>
    <head>
        ${scripts}
        <script>
            window.mermaidJsonp = window.mermaidJsonp || [];
            window.mermaidJsonp.push(function(mermaid) {
                window.addEventListener('load', function() {
                    mermaid.initialize({ theme: 'forest' });                    
                    mermaid.run();
                });
            });
        </script>
    </head>
    <body style="background: #FFF">
        ${result.html}    
    </body>
</html>    
    `;

    console.log(html);
})();
