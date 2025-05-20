const path = require("path");
const {
  loadPreviewOrConfigFile,
  getFrameworkName,
  normalizeStories,
  stripAbsNodeModulesPath,
} = require("@storybook/core-common");
const { logger } = require("@storybook/node-logger");
const { promise: glob } = require("glob-promise");

const absoluteToSpecifier = (generatedEntries, abs) =>
  "./" + path.relative(generatedEntries, abs);

module.exports.generatePreviewModern = async function generatePreviewModern(
  options,
  generatedEntries
) {
  const { presets, configDir } = options;
  const frameworkName = await getFrameworkName(options);

  const previewAnnotations = await presets.apply(
    "previewAnnotations",
    [],
    options
  );
  const relativePreviewAnnotations = [
    ...previewAnnotations.map(processPreviewAnnotation),
    absoluteToSpecifier(
      generatedEntries,
      loadPreviewOrConfigFile({ configDir })
    ),
  ].filter(Boolean);

  const generateHMRHandler = (frameworkName) => {
    // Web components are not compatible with HMR, so disable HMR, reload page instead.
    if (frameworkName === "@storybook/web-components-vite") {
      return `
      if (import.meta.hot) {
        import.meta.hot.decline();
      }`.trim();
    }

    return `
    if (import.meta.hot) {
      import.meta.hot.accept('${virtualStoriesFile}', (newModule) => {
      // importFn has changed so we need to patch the new one in
      preview.onStoriesChanged({ importFn: newModule.importFn });
      });

    import.meta.hot.accept(${JSON.stringify(
      relativePreviewAnnotations
    )}, ([...newConfigEntries]) => {
      const newGetProjectAnnotations =  () => composeConfigs(newConfigEntries);

      // getProjectAnnotations has changed so we need to patch the new one in
      preview.onGetProjectAnnotationsChanged({ getProjectAnnotations: newGetProjectAnnotations });
    });
  }`.trim();
  };

  /**
   * This code is largely taken from https://github.com/storybookjs/storybook/blob/d1195cbd0c61687f1720fefdb772e2f490a46584/lib/builder-webpack4/src/preview/virtualModuleModernEntry.js.handlebars
   * Some small tweaks were made to `getProjectAnnotations` (since `import()` needs to be resolved asynchronously)
   * and the HMR implementation has been tweaked to work with Vite.
   * @todo Inline variable and remove `noinspection`
   */
  const code = `
  import { composeConfigs, PreviewWeb, ClientApi } from '@storybook/preview-api';

  // generateAddonSetupCode
  import { createBrowserChannel } from '@storybook/channels';
  import { addons } from '@storybook/preview-api';

  const channel = createBrowserChannel({ page: 'preview' });
  addons.setChannel(channel);
  window.__STORYBOOK_ADDONS_CHANNEL__ = channel;

  ${
    // import { importFn } from '${virtualStoriesFile}';
    await generateImportFnScriptCode(options, generatedEntries)
  }

  const getProjectAnnotations = async () => {
    const configs = await Promise.all([${relativePreviewAnnotations
      .map((previewAnnotation) => `import('${previewAnnotation}')`)
      .join(",\n")}])
    return composeConfigs(configs);
  }

  const preview = new PreviewWeb();

  window.__STORYBOOK_PREVIEW__ = preview;
  window.__STORYBOOK_STORY_STORE__ = preview.storyStore;
  window.__STORYBOOK_CLIENT_API__ = new ClientApi({ storyStore: preview.storyStore });

  preview.initialize({ importFn, getProjectAnnotations });

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
 * Paths get passed either with no leading './' - e.g. `src/Foo.stories.js`,
 * or with a leading `../` (etc), e.g. `../src/Foo.stories.js`.
 * We want to deal in importPaths relative to the working dir, so we normalize
 */
function toImportPath(relativePath) {
  return relativePath.startsWith("../") ? relativePath : `./${relativePath}`;
}

/**
 * This function takes an array of stories and creates a mapping between the stories' relative paths
 * to the working directory and their dynamic imports. The import is done in an asynchronous function
 * to delay loading. It then creates a function, `importFn(path)`, which resolves a path to an import
 * function and this is called by Storybook to fetch a story dynamically when needed.
 * @param stories An array of absolute story paths.
 */
async function toImportFn(stories, generatedEntries) {
  const objectEntries = stories.map((file) => {
    const ext = path.extname(file);
    const relativePath = /*normalizePath*/ path.relative(process.cwd(), file);
    if (![".js", ".jsx", ".ts", ".tsx", ".mdx"].includes(ext)) {
      logger.warn(
        `Cannot process ${ext} file with storyStoreV7: ${relativePath}`
      );
    }

    return `  '${toImportPath(
      relativePath
    )}': async () => import('${absoluteToSpecifier(generatedEntries, file)}')`;
  });

  return `
    const importers = {
      ${objectEntries.join(",\n")}
    };

    async function importFn(path) {
        return importers[path]();
    }
  `;
}

async function generateImportFnScriptCode(options, generatedEntries) {
  // First we need to get an array of stories and their absolute paths.
  const stories = await listStories(options);

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
        const pattern = path.join(directory, files);

        return glob(
          path.isAbsolute(pattern)
            ? pattern
            : path.join(options.configDir, pattern),
          {
            follow: true,
          }
        );
      })
    )
  ).reduce((carry, stories) => carry.concat(stories), []);
}
