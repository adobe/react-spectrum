import path from "node:path";
import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import {
  loadPreviewOrConfigFile,
  normalizeStories,
} from "storybook/internal/common";

// @parcel/utils is CJS-only; use createRequire to load it from ESM
const _require = createRequire(import.meta.url);
const { relativePath } = _require("@parcel/utils");

// base64 helper for story: pipeline specifiers (globalThis.btoa exists in Node >=18)
const btoa = (s) => Buffer.from(s, "utf8").toString("base64");

/**
 * Strip absolute path prefix up to and including node_modules, returning a bare
 * specifier for the bundler. (Storybook 10 no longer exports this from internal/common.)
 */
function stripAbsNodeModulesPath(absPath) {
  const sep = path.sep;
  const splits = absPath.split(`node_modules${sep}`);
  const last = splits[splits.length - 1];
  return path.posix.normalize(last.replace(/\\/g, "/"));
}

/**
 * Convert a bare path like @storybook/react/dist/entry-preview-argtypes.js to the
 * package export subpath @storybook/react/entry-preview-argtypes so bundlers (Parcel)
 * resolve via package.json "exports" instead of raw dist files.
 * Paths like package/dist/index.js become package (main export), not package/index.
 */
function toPackageExportSpecifier(barePath) {
  const normalized = barePath.replace(/\\/g, "/");
  const distMatch = normalized.match(/^(@?[^/]+(?:\/[^/]+)?)\/dist\/(.+)\.js$/);
  if (distMatch) {
    const pkg = distMatch[1];
    const subpath = distMatch[2];
    // package/dist/index.js -> package (main export), not package/index
    if (subpath === "index") {
      return pkg;
    }
    return `${pkg}/${subpath}`;
  }
  return normalized;
}

/**
 * Inline IIFE that sets __STORYBOOK_ADDONS_PREVIEW on globalThis. Run this as the
 * first synchronous code in the preview entry so no Storybook chunk can run before it.
 */
function getInitAddonsGlobalIIFE() {
  return `(function() {
  var g = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};
  if (g.__STORYBOOK_ADDONS_PREVIEW) return;
  var noop = function(){};
  var placeholderChannel = { on: noop, emit: noop, removeListener: noop, off: noop };
  g.__STORYBOOK_ADDONS_CHANNEL__ = placeholderChannel;
  g.__STORYBOOK_ADDONS_PREVIEW = {
    _channel: null,
    setChannel: function(c){ this._channel = c; g.__STORYBOOK_ADDONS_CHANNEL__ = c; },
    getChannel: function(){ return this._channel || placeholderChannel; },
    ready: function(){ return Promise.resolve(this.getChannel()); },
    hasChannel: function(){ return !!this._channel; }
  };
})();`;
}

/**
 * Generate the preview entry bootstrap: runs init IIFE first, then dynamic-imports
 * preview-main.js so __STORYBOOK_ADDONS_PREVIEW exists before any other module runs.
 */
function generatePreviewBootstrap() {
  return getInitAddonsGlobalIIFE() + "\nimport('./preview-main.js');";
}

/**
 * Generate a zero-dependency module that sets __STORYBOOK_ADDONS_PREVIEW (kept for
 * backwards compatibility; bootstrap approach is preferred).
 */
function generateInitAddonsGlobal() {
  return getInitAddonsGlobalIIFE();
}

/**
 * Generate the addon setup module (like Vite's VIRTUAL_ADDON_SETUP_FILE).
 * Must be imported before the runtime so the channel and addons store exist
 * before any runtime code runs. See storybook builder-vite codegen-modern-iframe-script.ts
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

async function generatePreviewModern(
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

  const importFnCode = await generateImportFnScriptCode(options, generatedEntries);

  /**
   * Main preview module (loaded by preview.js bootstrap via dynamic import).
   * runtime MUST be the first import so its top-level setup() call populates
   * __STORYBOOK_MODULE_* globals before setup-addons.js (or any other externalized
   * specifier) evaluates. Matches upstream Vite/webpack5 ordering.
   * See storybook builder-vite codegen-modern-iframe-script.ts
   */
  const code = `
import { setup } from 'storybook/internal/preview/runtime';
import './setup-addons.js';

setup();

${importFnCode.imports}
import { composeConfigs, PreviewWeb } from 'storybook/preview-api';

${importFnCode.body}

const getProjectAnnotations = async () => {
  const configs = await Promise.all([${relativePreviewAnnotations
    .map((previewAnnotation) => `import('${previewAnnotation}')`)
    .join(",\n")}]);
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
  if (typeof annotationPath === "object") {
    return toPackageExportSpecifier(annotationPath.bare);
  }
  // resolve relative paths into absolute paths, but don't resolve "bare" imports
  if (annotationPath?.startsWith("./") || annotationPath?.startsWith("../")) {
    return annotationPath;
  }
  // This should not occur, since we use `.filter(Boolean)` prior to
  // calling this function, but this makes typescript happy
  if (!annotationPath) {
    throw new Error("Could not determine path for previewAnnotation");
  }

  // For addon dependencies that use require.resolve(), we need to convert to a bare path
  // so that the bundler can resolve it. Use package export subpaths (e.g. @storybook/react/entry-preview-argtypes)
  // so package.json "exports" are respected (required in Storybook 10).
  if (annotationPath.includes("node_modules")) {
    const bare = stripAbsNodeModulesPath(annotationPath);
    return toPackageExportSpecifier(bare);
  }

  return /*slash*/ annotationPath;
}

/**
 * This file is largely based on https://github.com/storybookjs/storybook/blob/d1195cbd0c61687f1720fefdb772e2f490a46584/lib/core-common/src/utils/to-importFn.ts
 */

/**
 * Emit top-level static imports for each story glob resolved via the `story:`
 * pipeline. Each virtual module's default export is a map of
 * `{ relativePathFromCwd: () => import(storyFile) }`. Merge those maps into
 * a single importers object and expose importFn(path).
 */
async function toImportFn(stories, generatedEntries) {
  const importLines = stories.map((glob, i) => {
    const specifier = 'story:' + btoa(relativePath(generatedEntries, glob));
    return `import stories_${i} from ${JSON.stringify(specifier)};`;
  });
  const mergeArgs = stories.map((_, i) => `stories_${i}`).join(', ');

  return {
    imports: importLines.join('\n'),
    body: `
const importers = Object.assign({}, ${mergeArgs});

async function importFn(path) {
  return importers[path]();
}
`.trim(),
  };
}

async function generateImportFnScriptCode(options, generatedEntries) {
  const stories = await listStories(options);
  return toImportFn(stories, generatedEntries);
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

export {
  generateInitAddonsGlobal,
  generatePreviewBootstrap,
  generateSetupAddons,
  generatePreviewModern,
};
