esbuild src/plugin/index.ts --outfile=plugin/index.js \
  --bundle --platform=node \
  --sourcemap \
  --external:markdown-it --external:node:* \
  --define:PACKAGE="\"$(node -pe "require('./package.json').name")\""
