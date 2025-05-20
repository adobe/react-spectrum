const path = require("path");
const {
  normalizeStories,
  loadPreviewOrConfigFile,
} = require("@storybook/core-common");

module.exports.generatePreview = async function generatePreview(
  options,
  generatedEntries
) {
  let { presets } = options;
  let configs = [
    ...(await presets.apply("config", [], options)),
    loadPreviewOrConfigFile(options),
  ].filter(Boolean);
  let stories = normalizeStories(await presets.apply("stories", [], options), {
    configDir: options.configDir,
    workingDir: process.cwd(),
  });

  let dir = path.relative(
    generatedEntries,
    path.join(process.cwd(), stories[0].directory)
  );
  let files = stories[0].files;

  let code = `
    import 'regenerator-runtime';
    import {configure} from '@storybook/react';
    import {
      addDecorator,
      addParameters,
      addLoader,
      addArgTypesEnhancer,
      addArgsEnhancer
    } from '@storybook/preview-api';
    import { logger } from '@storybook/client-logger';
    import * as stories from '${path.join(dir, files)}';
    ${configs
      .map(
        (config, i) =>
          `import * as config_${i} from '${path.relative(
            generatedEntries,
            config
          )}';`
      )
      .join("\n")}
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

  return code;
};
