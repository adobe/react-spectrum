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
 * Generate the addon setup module (analogous to Vite's VIRTUAL_ADDON_SETUP_FILE
 * in code/builders/builder-vite/src/codegen-modern-iframe-script.ts).
 *
 * Creates the browser channel, registers it with the addons store, and
 * exposes it on `window.__STORYBOOK_ADDONS_CHANNEL__` (and the server-channel
 * alias in dev). Must be imported AFTER `storybook/internal/preview/runtime`
 * so the externalized `storybook/preview-api` specifier already has access to
 * `globalThis.__STORYBOOK_MODULE_PREVIEW_API__` (populated by the runtime's
 * import-time `setup()`), and BEFORE `new PreviewWeb(...)` is constructed,
 * since PreviewWeb relies on the channel and addons store being in place.
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
   * Main preview module loaded directly by iframe.html as <script type="module">.
   *
   * Import order is load-bearing:
   *   1. `storybook/internal/preview/runtime` MUST evaluate first. Its file-level
   *      `setup()` side-effect populates `__STORYBOOK_MODULE_PREVIEW_API__`,
   *      `__STORYBOOK_MODULE_CHANNELS__`, etc. on globalThis.
   *   2. `./setup-addons.js` then imports from `storybook/preview-api`, which
   *      parcel-resolver-storybook redirects to a cache file that reads
   *      `globalThis.__STORYBOOK_MODULE_PREVIEW_API__`. The globals are now
   *      populated, so the destructure succeeds.
   *   3. `setup()` is called explicitly to match upstream Vite, but in practice
   *      the import-time side-effect of step 1 has already done the work.
   *
   * See code/builders/builder-vite/src/codegen-modern-iframe-script.ts.
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

// Rewrite absolute `node_modules/@storybook/foo/dist/preview.js`
// previewAnnotation paths into bare specifiers Parcel can resolve through
// `package.json#exports`. Upstream Vite (`processPreviewAnnotation`) and
// webpack5 (`slash(entry)`) sidestep this because their resolvers accept
// absolute paths against package exports; Parcel's resolver does not.
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
 * Emit top-level static imports for each story glob resolved via the `story:`
 * pipeline. Each virtual module's default export is a map of
 * `{ relativePathFromCwd: () => import(storyFile) }`. We merge those maps into
 * a single `importers` object and expose `importFn(path)` for Storybook to
 * call when it needs to load a story.
 *
 * Why static imports + Object.assign instead of dynamic import + spread?
 * Concretely, instead of:
 *
 *     const mods = await Promise.all([
 *       import('story:abc...'),
 *       import('story:def...'),
 *     ]);
 *     const importers = Object.assign({}, ...mods.map(m => m.default));
 *
 * we emit:
 *
 *     import stories_0 from 'story:abc...';
 *     import stories_1 from 'story:def...';
 *     const importers = Object.assign({}, stories_0, stories_1);
 *
 * Under Parcel's CJS dev-mode wrappers the dynamic-import pattern raced
 * runtime initialization and would intermittently drop stories. Static
 * imports put the virtual modules on the module graph so Parcel sequences
 * them deterministically before the `importFn` closure ever runs.
 *
 * Conceptually similar to Storybook's own `to-importFn` helper (originally
 * in `lib/core-common`, now under `code/core/src/core-common` in SB10).
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
  generateSetupAddons,
  generatePreviewModern,
};
