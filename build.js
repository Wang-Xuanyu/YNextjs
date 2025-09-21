// build.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { build, buildSync } from 'esbuild';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const pagesDir = './pages';
const tempDir = './tempPages';
const tempModules = './tempModules';
const outputDir = './dist/pages';
const outputDataDir = './dist/data';

fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(tempModules, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(outputDataDir, { recursive: true });

const appFile = path.join(pagesDir, '_app.js');
let AppWrapper = ({ Component, pageProps }) => React.createElement(Component, pageProps);

if (fs.existsSync(appFile)) {
  const appOut = path.join(tempModules, '_app.js');
  buildSync({
    entryPoints: [appFile],
    outfile: appOut,
    platform: 'node',
    format: 'esm',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
  });
  const appUrl = pathToFileURL(path.resolve(appOut)).href;
  const appMod = await import(appUrl);
  if (typeof appMod.default === 'function') {
    AppWrapper = appMod.default;
  }
}

function getAllPageFiles(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result.push(...getAllPageFiles(fullPath));
    } else if (!entry.startsWith('_') && (entry.endsWith('.jsx') || entry.endsWith('.js'))) {
      result.push(fullPath);
    }
  }
  return result;
}

function routeFromFile(filePath) {
  const relative = path.relative(pagesDir, filePath).replace(/\\/g, '/');
  const withoutExt = relative.replace(/\.(js|jsx)$/, '');
  return withoutExt === 'index' ? '' : withoutExt;
}

function pathFromParams(route, params = {}) {
  const replaced = route.replace(/\[(.+?)\]/g, (_, name) => params[name]);
  return replaced;
}

const entryFiles = getAllPageFiles(pagesDir);

for (const filePath of entryFiles) {
  const route = routeFromFile(filePath);
  const tempEntry = path.join(tempDir, route.replace(/\//g, '-') + '.js');
  const relImport = '../' + filePath.replace(/\\/g, '/');
  fs.writeFileSync(tempEntry, `import Component from '${relImport}'; export default Component;`);

  // Try browser build
  try {
    await build({
      entryPoints: [tempEntry],
      outdir: path.join(outputDir, path.dirname(route)),
      entryNames: path.basename(route),
      bundle: true,
      loader: { '.js': 'jsx', '.jsx': 'jsx' },
      define: { 'process.env.NODE_ENV': '"production"' },
    });
    console.log(`✅ Built page for browser: ${route}`);
  } catch (err) {
    console.log(`⏭️ Skipped browser build for: ${route} (Node-only module detected)`);
  }

  // Build for node
  const nodeOut = path.join(tempModules, route.replace(/\//g, '-') + '.js');
  buildSync({
    entryPoints: [filePath],
    outfile: nodeOut,
    platform: 'node',
    format: 'esm',
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
  });
  const modUrl = pathToFileURL(path.resolve(nodeOut)).href;
  const mod = await import(modUrl);

  const paths = typeof mod.getStaticPaths === 'function'
    ? (await mod.getStaticPaths()).paths
    : [ { params: {} } ];

  for (const { params } of paths) {
    const props = typeof mod.getStaticProps === 'function'
      ? (await mod.getStaticProps({ params }))?.props || {}
      : {};

    let finalRoute = pathFromParams(route, params);
    if (finalRoute === '') finalRoute = 'index';
    const outputHtml = path.join(outputDir, finalRoute + '.html');
    const outputJson = path.join(outputDataDir, finalRoute + '.json');

    fs.mkdirSync(path.dirname(outputHtml), { recursive: true });
    fs.mkdirSync(path.dirname(outputJson), { recursive: true });

    const element = React.createElement(AppWrapper, {
      Component: mod.default,
      pageProps: props,
    });

    const html = ReactDOMServer.renderToStaticMarkup(element);
    fs.writeFileSync(outputHtml, html);
    fs.writeFileSync(outputJson, JSON.stringify(props, null, 2));

    console.log(`📄 Static HTML saved: ${outputHtml}`);
  }
}
