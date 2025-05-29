const path = require("path");
const {
  loadPreviewOrConfigFile,
  normalizeStories,
  stripAbsNodeModulesPath,
} = require("@storybook/core-common");
const {relativePath} = require('@parcel/utils');

module.exports.generatePreviewModern = async function generatePreviewModern(
  options,
  generatedEntries
) {
  const { presets, configDir } = options;

  const previewAnnotations = await presets.apply(
    "previewAnnotations",
    [],
    options
  );
  const relativePreviewAnnotations = [
    ...previewAnnotations.map(processPreviewAnnotation),
    relativePath(
      generatedEntries,
      loadPreviewOrConfigFile({ configDir })
    ),
  ].filter(Boolean);

  /**
   * This code is largely taken from https://github.com/storybookjs/storybook/blob/d1195cbd0c61687f1720fefdb772e2f490a46584/lib/builder-webpack4/src/preview/virtualModuleModernEntry.js.handlebars
   * Some small tweaks were made to `getProjectAnnotations` (since `import()` needs to be resolved asynchronously)
   * and the HMR implementation has been tweaked to work with Vite.
   * @todo Inline variable and remove `noinspection`
   */
  const code = `
  import { setup } from 'storybook/internal/preview/runtime';

  setup();

  import { createBrowserChannel } from 'storybook/internal/channels';
  import { addons } from 'storybook/internal/preview-api';

  const channel = createBrowserChannel({ page: 'preview' });
  addons.setChannel(channel);
  window.__STORYBOOK_ADDONS_CHANNEL__ = channel;

  if (window.CONFIG_TYPE === 'DEVELOPMENT'){
    window.__STORYBOOK_SERVER_CHANNEL__ = channel;
  }

  import { composeConfigs, PreviewWeb } from 'storybook/internal/preview-api';
  import { isPreview } from 'storybook/internal/csf';

  ${await generateImportFnScriptCode(options, generatedEntries)}

  const getProjectAnnotations = async () => {
    const configs = await Promise.all([${relativePreviewAnnotations
      .map((previewAnnotation) => `import('${previewAnnotation}')`)
      .join(",\n")}])
    return composeConfigs(configs);
  }


  window.__STORYBOOK_PREVIEW__ = window.__STORYBOOK_PREVIEW__ || new PreviewWeb(importFn, getProjectAnnotations);

  window.__STORYBOOK_STORY_STORE__ = window.__STORYBOOK_STORY_STORE__ || window.__STORYBOOK_PREVIEW__.storyStore;


  module.hot.accept(() => {
    // importFn has changed so we need to patch the new one in
    window.__STORYBOOK_PREVIEW__.onStoriesChanged({ importFn });

    // getProjectAnnotations has changed so we need to patch the new one in
    window.__STORYBOOK_PREVIEW__.onGetProjectAnnotationsChanged({ getProjectAnnotations });
  });
 `;
  // ${generateHMRHandler(frameworkName)};
  return code;
};

function processPreviewAnnotation(path) {
  // If entry is an object, take the first, which is the
  // bare (non-absolute) specifier.
  // This is so that webpack can use an absolute path, and
  // continue supporting super-addons in pnp/pnpm without
  // requiring them to re-export their sub-addons as we do
  // in addon-essentials.
  if (typeof path === "object") {
    return path.bare;
  }
  // resolve relative paths into absolute paths, but don't resolve "bare" imports
  if (path?.startsWith("./") || path?.startsWith("../")) {
    return /*slash*/ path.resolve(path);
  }
  // This should not occur, since we use `.filter(Boolean)` prior to
  // calling this function, but this makes typescript happy
  if (!path) {
    throw new Error("Could not determine path for previewAnnotation");
  }

  // For addon dependencies that use require.resolve(), we need to convert to a bare path
  // so that vite will process it as a dependency (cjs -> esm, etc).
  if (path.includes("node_modules")) {
    return stripAbsNodeModulesPath(path);
  }

  return /*slash*/ path;
}

/**
 * This file is largely based on https://github.com/storybookjs/storybook/blob/d1195cbd0c61687f1720fefdb772e2f490a46584/lib/core-common/src/utils/to-importFn.ts
 */

/**
 * This function takes an array of stories and creates a mapping between the stories' relative paths
 * to the working directory and their dynamic imports. The import is done in an asynchronous function
 * to delay loading. It then creates a function, `importFn(path)`, which resolves a path to an import
 * function and this is called by Storybook to fetch a story dynamically when needed.
 * @param stories An array of absolute story paths.
 */
async function toImportFn(stories, generatedEntries) {
  const entries = stories.map(glob => {
    return `...import(${JSON.stringify('story:' + btoa(relativePath(generatedEntries, glob)))})`;
  });

  return `
    const importers = {
      ${entries.join(',\n')}
    };

    async function importFn(path) {
      return importers[path]();
    }
  `;
}

async function generateImportFnScriptCode(options, generatedEntries) {
  // First we need to get an array of stories and their absolute paths.
  let stories = await listStories(options);

  // We can then call toImportFn to create a function that can be used to load each story dynamically.
  return (await toImportFn(stories, generatedEntries)).trim();
}

async function listStories(options) {
  return (
    await Promise.all(
      normalizeStories(await options.presets.apply("stories", [], options), {
        configDir: options.configDir,
        workingDir: options.configDir,
      }).map(({ directory, files }) => {
        let pattern = path.join(directory, files);
        return path.isAbsolute(pattern)
          ? pattern
          : path.join(options.configDir, pattern);
      })
    )
  ).reduce((carry, stories) => carry.concat(stories), []);
}
