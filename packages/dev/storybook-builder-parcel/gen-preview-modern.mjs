import path from 'node:path';
import {Buffer} from 'node:buffer';
import {createRequire} from 'node:module';
import {loadPreviewOrConfigFile, normalizeStories} from 'storybook/internal/common';

// @parcel/utils is CJS-only; use createRequire to load it from ESM
const _require = createRequire(import.meta.url);
const {relativePath} = _require('@parcel/utils');

// base64 helper for story: pipeline specifiers (globalThis.btoa exists in Node >=18)
const btoa = s => Buffer.from(s, 'utf8').toString('base64');

/**
 * Strip the absolute path prefix up to and including `node_modules`, returning
 * a bare specifier the bundler can resolve. (Storybook 10 no longer exports
 * this helper from `storybook/internal/common`, so we inline our own.)
 *
 * Background: addons advertise their preview entries as absolute
 * `node_modules/@storybook/foo/dist/preview.js` paths via the
 * `previewAnnotations` preset, but each package's `exports` map only exposes
 * the bare subpath (e.g. `./preview`) -- not the dist file. Parcel's resolver
 * honors `exports`, so we must rewrite the absolute path into a bare specifier
 * before handing it off (see also `toPackageExportSpecifier`).
 */
function stripAbsNodeModulesPath(absPath) {
  const sep = path.sep;
  const splits = absPath.split(`node_modules${sep}`);
  const last = splits[splits.length - 1];
  return path.posix.normalize(last.replace(/\\/g, '/'));
}

/**
 * Convert a bare path like @storybook/react/dist/entry-preview-argtypes.js to the
 * package export subpath @storybook/react/entry-preview-argtypes so bundlers (Parcel)
 * resolve via package.json "exports" instead of raw dist files.
 * Paths like package/dist/index.js become package (main export), not package/index.
 */
function toPackageExportSpecifier(barePath) {
  const normalized = barePath.replace(/\\/g, '/');
  const distMatch = normalized.match(/^(@?[^/]+(?:\/[^/]+)?)\/dist\/(.+)\.js$/);
  if (distMatch) {
    const pkg = distMatch[1];
    const subpath = distMatch[2];
    // package/dist/index.js -> package (main export), not package/index
    if (subpath === 'index') {
      return pkg;
    }
    return `${pkg}/${subpath}`;
  }
  return normalized;
}

/**
 * Generate the addon setup module (similar to Vite's VIRTUAL_ADDON_SETUP_FILE
 * in code/builders/builder-vite/src/codegen-modern-iframe-script.ts).
 */
function generateSetupAddons() {
  return `
import { addons } from 'storybook/preview-api';
import { createBrowserChannel } from 'storybook/internal/channels';

const channel = createBrowserChannel({ page: 'preview' });
addons.setChannel(channel);
window.__STORYBOOK_ADDONS_CHANNEL__ = channel;

if (window.CONFIG_TYPE === 'DEVELOPMENT') {
  window.__STORYBOOK_SERVER_CHANNEL__ = channel;
}
`.trim();
}

async function generatePreviewModern(options, generatedEntries) {
  const {presets, configDir} = options;

  const previewAnnotations = await presets.apply('previewAnnotations', [], options);
  const relativePreviewAnnotations = [
    ...previewAnnotations.map(processPreviewAnnotation),
    relativePath(generatedEntries, loadPreviewOrConfigFile({configDir}))
  ].filter(Boolean);

  const importFnCode = await generateImportFnScriptCode(options, generatedEntries);

  /**
   * Main preview module loaded directly by iframe.html as <script type="module">.
   *
   * Import order is load-bearing:
   *   1. `storybook/internal/preview/runtime` MUST evaluate first. Its file-level
   *      `setup()` side-effect populates `__STORYBOOK_MODULE_PREVIEW_API__`,
   *      `__STORYBOOK_MODULE_CHANNELS__`, etc. on globalThis.
   *   2. `./setup-addons.js` then imports from `storybook/preview-api`, which
   *      parcel-resolver-storybook redirects to a global-reading shim. The
   *      globals are populated by step 1, so the read succeeds.
   *   3. The `story:` synthetic modules are static-imported (one named
   *      `importer` per stories glob). They live in Parcel's module graph,
   *      so file additions trigger StorybookResolver's invalidateOnFileCreate.
   *
   * See code/builders/builder-vite/src/codegen-modern-iframe-script.ts and
   * code/lib/core-webpack/src/to-importFn.ts for the upstream patterns this
   * mirrors.
   */
  const code = `
import { setup } from 'storybook/internal/preview/runtime';
import './setup-addons.js';
import { composeConfigs, PreviewWeb } from 'storybook/preview-api';

setup();

${importFnCode}

const getProjectAnnotations = async () => {
  const configs = await Promise.all([${relativePreviewAnnotations
    .map(previewAnnotation => `import('${previewAnnotation}')`)
    .join(',\n')}]);
  return composeConfigs(configs);
};

window.__STORYBOOK_PREVIEW__ = window.__STORYBOOK_PREVIEW__ || new PreviewWeb(importFn, getProjectAnnotations);
window.__STORYBOOK_STORY_STORE__ = window.__STORYBOOK_STORY_STORE__ || window.__STORYBOOK_PREVIEW__.storyStore;

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    window.__STORYBOOK_PREVIEW__.onStoriesChanged({ importFn });
    window.__STORYBOOK_PREVIEW__.onGetProjectAnnotationsChanged({ getProjectAnnotations });
  });
}
`;
  return code;
}

function processPreviewAnnotation(annotationPath) {
  // If entry is an object, take the first, which is the
  // bare (non-absolute) specifier.
  // This is so that webpack can use an absolute path, and
  // continue supporting super-addons in pnp/pnpm without
  // requiring them to re-export their sub-addons as we do
  // in addon-essentials.
  if (typeof annotationPath === 'object') {
    return toPackageExportSpecifier(annotationPath.bare);
  }
  // resolve relative paths into absolute paths, but don't resolve "bare" imports
  if (annotationPath?.startsWith('./') || annotationPath?.startsWith('../')) {
    return annotationPath;
  }
  // This should not occur, since we use `.filter(Boolean)` prior to
  // calling this function, but this makes typescript happy
  if (!annotationPath) {
    throw new Error('Could not determine path for previewAnnotation');
  }

  // For addon dependencies that use require.resolve(), we need to convert to a bare path
  // so that the bundler can resolve it. Use package export subpaths (e.g. @storybook/react/entry-preview-argtypes)
  // so package.json "exports" are respected (required in Storybook 10).
  if (annotationPath.includes('node_modules')) {
    const bare = stripAbsNodeModulesPath(annotationPath);
    return toPackageExportSpecifier(bare);
  }

  return /*slash*/ annotationPath;
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
      normalizeStories(await options.presets.apply('stories', [], options), {
        configDir: options.configDir,
        workingDir: options.configDir
      }).map(({directory, files}) => {
        let pattern = path.join(directory, files);
        return path.isAbsolute(pattern) ? pattern : path.join(options.configDir, pattern);
      })
    )
  ).reduce((carry, stories) => carry.concat(stories), []);
}

export {generateSetupAddons, generatePreviewModern};
