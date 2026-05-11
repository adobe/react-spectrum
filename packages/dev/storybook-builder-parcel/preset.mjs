// Storybook 10 Builder API entrypoint.
// Contract: https://storybook.js.org/docs/builders/builder-api
//   - `start({ options, router })`  -> dev mode; returns { bail, stats, totalTime }
//   - `build({ options })`          -> production build
//   - `bail()`                      -> top-level cleanup hook called by Storybook on error/SIGINT
//   - `corePresets` / `overridePresets` -> arrays of preset paths Storybook merges in
//
// Reference implementations:
//   - code/builders/builder-vite/src/index.ts
//   - code/builders/builder-webpack5/src/index.ts

import {Parcel} from '@parcel/core';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createProxyMiddleware} from 'http-proxy-middleware';
import fs from 'node:fs';

import {generateIframeModern} from './gen-iframe-modern.mjs';
import {generatePreviewModern, generateSetupAddons} from './gen-preview-modern.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedEntries = path.join(__dirname, 'generated-entries');

// Module-scope so the top-level `bail()` can reach it. Aligns with
// builder-webpack5's pattern of holding a single watcher handle on the module.
let watcherSubscription;

export async function start({options, router}) {
  const parcel = await createParcel(options, true);

  // Storybook's CLI runs an Express-style server on :9003 (the user-facing
  // dev URL). Parcel's own dev server runs on :3000 to serve iframe.html and
  // the bundle assets. We mount a reverse proxy on Storybook's router so that
  // any request that isn't the manager's own /index.html falls through to
  // Parcel. If Parcel returns 404 or HTML for a non-iframe URL we hand the
  // request back to next() so Storybook's manager middleware can handle it.
  router.use(async (req, res, next) => {
    if (req.url === '/' || req.url === '/index.html') return next();

    const proxy = createProxyMiddleware({
      target: 'http://localhost:3000/',
      selfHandleResponse: true,
      logLevel: 'warn',
      onProxyRes(proxyRes, req, res) {
        if (
          proxyRes.statusCode === 404 ||
          (proxyRes.headers['content-type']?.startsWith('text/html') &&
            !req.url.startsWith('/iframe.html'))
        ) {
          return next();
        }
        res.statusCode = proxyRes.statusCode;
        for (const header in proxyRes.headers) {
          res.setHeader(header, proxyRes.headers[header]);
        }
        proxyRes.pipe(res);
      }
    });

    const {socket, connection} = req;
    req.socket = null;
    req.connection = null;
    await proxy(req, res, next);
    req.socket = socket;
    req.connection = connection;
  });

  watcherSubscription = await parcel.watch();
  process.on('SIGINT', async () => {
    await watcherSubscription?.unsubscribe();
    process.exit();
  });

  return {
    async bail() {
      await watcherSubscription?.unsubscribe();
    },
    stats: {},
    totalTime: 0
  };
}

export async function build({options}) {
  const parcel = await createParcel(options);
  await parcel.run();
}

// No core presets to register; previewAnnotations come transitively from
// @storybook/react via core.renderer (see storybook-react-parcel/preset.mjs).
export const corePresets = [];

// Storybook calls this top-level `bail` on errors and SIGINT; closing the
// Parcel watcher here prevents the dev process from leaving a file watcher
// alive after Storybook has already torn down.
export async function bail() {
  await watcherSubscription?.unsubscribe();
}

// Builder is driven by three files this preset writes into ./generated-entries:
//   - iframe.html      <- Parcel's bundle entry point (HTML asset)
//   - preview-main.js  <- ESM script loaded by iframe.html (the preview entry)
//   - setup-addons.js  <- ESM module imported by preview-main.js
//
// Two more sources of input come from parcel-resolver-storybook:
//   - a synthetic `stories.js` virtual module emitted for each `story:` glob
//     dependency (lives in Parcel's module graph, not on disk)
async function createParcel(options, isDev = false) {
  fs.mkdirSync(generatedEntries, {recursive: true});
  fs.writeFileSync(
    path.join(generatedEntries, 'iframe.html'),
    await generateIframeModern(options, generatedEntries)
  );
  fs.writeFileSync(path.join(generatedEntries, 'setup-addons.js'), generateSetupAddons());
  fs.writeFileSync(
    path.join(generatedEntries, 'preview-main.js'),
    await generatePreviewModern(options, generatedEntries)
  );

  return new Parcel({
    entries: path.join(generatedEntries, 'iframe.html'),
    config: path.resolve(options.configDir, '.parcelrc'),
    mode: isDev ? 'development' : 'production',
    serveOptions: isDev ? {port: 3000} : null,
    hmrOptions: isDev ? {port: 3001} : null,
    additionalReporters: [{packageName: '@parcel/reporter-cli', resolveFrom: __filename}],
    targets: {
      storybook: {
        distDir: options.outputDir,
        publicUrl: './',
        engines: {
          browsers: [
            'last 2 Chrome version',
            'last 2 Safari versions',
            'last 2 Edge version',
            'last 2 Firefox versions'
          ]
        }
      }
    }
  });
}
