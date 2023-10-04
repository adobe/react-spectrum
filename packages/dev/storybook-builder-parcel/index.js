const {Parcel} = require('@parcel/core');
const path = require('path');
const {createProxyMiddleware} = require('http-proxy-middleware');
const {normalizeStories, loadPreviewOrConfigFile} = require('@storybook/core-common');
const fs = require('fs');

exports.start = async function ({options, router}) {
  let parcel = await createParcel(options, true);

  router.use(async (req, res, next) => {
    if (req.url === '/' || req.url === '/index.html') {
      return next();
    }

    let proxy = createProxyMiddleware({
      target: 'http://localhost:3000/',
      selfHandleResponse: true,
      logLevel: 'warn',
      onProxyRes(proxyRes, req, res) {
        // Parcel dev server responds with main HTML page if the file doesn't exist...
        if (proxyRes.statusCode === 404 || (proxyRes.headers['content-type']?.startsWith('text/html') && !req.url.startsWith('/iframe.html'))) {
          return next();
        } else {
          res.statusCode = proxyRes.statusCode;
          for (let header in proxyRes.headers) {
            res.setHeader(header, proxyRes.headers[header]);
          }
          proxyRes.pipe(res);
        }
      }
    });

    // Remove socket/connection temporarily to prevent proxy from subscribing to `close` event and triggering warning.
    let {socket, connection} = req;
    req.socket = null;
    req.connection = null;
    await proxy(req, res, next);
    req.socket = socket;
    req.connection = connection;
  });

  let subscription = await parcel.watch();
  process.on('SIGINT', async () => {
    await subscription.unsubscribe();
    process.exit();
  });

  return {
    async bail(e) {
      await subscription.unsubscribe();
    },
    stats: {},
    totalTime: 0
  };
};

exports.build = async function ({options}) {
  let parcel = await createParcel(options);
  await parcel.run();
};

exports.corePresets = [];
exports.previewPresets = [];

exports.bail = async function (e) {};

async function createParcel(options, isDev = false) {
  await generateHTML(options);
  await generateJS(options);

  return new Parcel({
    entries: path.join(__dirname, 'iframe.html'),
    config: path.resolve(__dirname, '..', '..', '..', '.parcelrc-storybook'),
    mode: isDev ? 'development' : 'production',
    serveOptions: isDev ? {
      port: 3000
    } : null,
    hmrOptions: isDev ? {
      port: 3001
    } : null,
    additionalReporters: [
      {
        packageName: '@parcel/reporter-cli',
        resolveFrom: __filename
      }
    ],
    defaultTargetOptions: {
      distDir: options.outputDir,
      publicUrl: './',
      shouldScopeHoist: false // TODO
    }
  });
}

async function generateHTML(options, overlayFS) {
  const {configType, features, framework, presets, serverChannelUrl, title} = options;
  const headHtmlSnippet = await presets.apply('previewHead');
  const bodyHtmlSnippet = await presets.apply('previewBody');
  const logLevel = await presets.apply('logLevel', undefined);
  const frameworkOptions = await presets.apply(`${framework}Options`, {});
  const coreOptions = await presets.apply('core');
  const stories = normalizeStories(await options.presets.apply('stories', [], options), {
    configDir: options.configDir,
    workingDir: process.cwd()
  }).map((specifier) => ({
    ...specifier,
    importPathMatcher: specifier.importPathMatcher.source
  }));

  let html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title || 'Storybook'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script>
        window.CONFIG_TYPE = '${configType || ''}';
        window.LOGLEVEL = '${logLevel || ''}';
        window.FRAMEWORK_OPTIONS = ${JSON.stringify(frameworkOptions || {})};
        window.CHANNEL_OPTIONS = ${JSON.stringify(coreOptions && coreOptions.channelOptions ? coreOptions.channelOptions : {})};
        window.FEATURES = ${JSON.stringify(features || {})};
        window.STORIES = ${JSON.stringify(stories || {})};
        window.SERVER_CHANNEL_URL = '${serverChannelUrl || ''}';
      </script>
      ${headHtmlSnippet || ''}
      <style>
        #root[hidden],
        #docs-root[hidden] {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${bodyHtmlSnippet || ''}
      <div id="root"></div>
      <div id="docs-root"></div>
      <script src="preview.js" type="module"></script>
    </body>
  </html>
  `;

  fs.writeFileSync(path.join(__dirname, 'iframe.html'), html);
}

async function generateJS(options, overlayFS) {
  let {presets} = options;
  let configs = [
    ...(await presets.apply('config', [], options)),
    loadPreviewOrConfigFile(options)
  ].filter(Boolean);
  let stories = normalizeStories(await presets.apply('stories', [], options), {
    configDir: options.configDir,
    workingDir: process.cwd()
  });

  let dir = path.relative(__dirname, path.join(process.cwd(), stories[0].directory));
  let files = stories[0].files;

  let previewScript = `
    import 'regenerator-runtime';
    import {configure} from '@storybook/react';
    import {
      addDecorator,
      addParameters,
      addLoader,
      addArgTypesEnhancer,
      addArgsEnhancer
    } from '@storybook/client-api';
    import { logger } from '@storybook/client-logger';
    import * as stories from '${path.join(dir, files)}';
    ${configs.map((config, i) => `import * as config_${i} from '${path.relative(__dirname, config)}';`).join('\n')}
    let configs = [${configs.map((_, i) => `config_${i}`)}];

    configs.forEach(config => {
      Object.keys(config).forEach((key) => {
        const value = config[key];
        switch (key) {
          case 'args':
          case 'argTypes': {
            return logger.warn('Invalid args/argTypes in config, ignoring.', JSON.stringify(value));
          }
          case 'decorators': {
            return value.forEach((decorator) => addDecorator(decorator, false));
          }
          case 'loaders': {
            return value.forEach((loader) => addLoader(loader, false));
          }
          case 'parameters': {
            return addParameters({ ...value }, false);
          }
          case 'argTypesEnhancers': {
            return value.forEach((enhancer) => addArgTypesEnhancer(enhancer));
          }
          case 'argsEnhancers': {
            return value.forEach((enhancer) => addArgsEnhancer(enhancer))
          }
          case 'globals':
          case 'globalTypes': {
            const v = {};
            v[key] = value;
            return addParameters(v, false);
          }
          case 'decorateStory':
          case 'renderToDOM':
          case 'render': {
            return null; // This key is not handled directly in v6 mode.
          }
          default: {
            // eslint-disable-next-line prefer-template
            return console.log(key + ' was not supported :( !');
          }
        }
      });
    });

    let keyMap = {};
    function walk(obj, key) {
      for (let k in obj) {
        if (k === 'tsx' || k === 'ts' || k === 'js' || k === 'jsx') {
          keyMap[key + '.' + k] = obj[k];
        } else {
          walk(obj[k], (key ? key + '/' : '') + k);
        }
      }
    }

    walk(stories);

    function context(key) {
      return keyMap[key];
    }

    context.keys = () => Object.keys(keyMap);
    context.resolve = (key) => key;

    configure(context, module, false);
  `;

  fs.writeFileSync(path.join(__dirname, 'preview.js'), previewScript);
}
