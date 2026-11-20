// Helpers for parcel-reporter-turbosnap-stats. See ./StatsReporter.ts for the
// plugin entry; this file holds the pure functions exported for unit testing.

import path from 'path';

// TurboSnap may still report 0% reuse for reasons outside this reporter's control:
//   1. Lockfile-only diff with no node_modules in stats — we DO include node_modules,
//      but filter @parcel/runtime-* and react/jsx-runtime (mirrors builder-vite). If
//      a react upgrade fails to propagate, this filter is the suspect.
//   2. Changes under .storybook/ or .chromatic/ — chromatic-cli treats these as
//      Storybook-config changes and bails to full snapshot. By design.
//   3. Changes under any configured staticDir — same bail.
// See chromatic-cli node-src/lib/turbosnap/getDependentStoryFiles.ts lines 250-269.

export interface Reason {
  moduleName: string;
}
export interface Module {
  id: string;
  name: string;
  reasons: Reason[];
}
export interface Stats {
  modules: Module[];
}

// The subset of the Parcel 3 plugin API used here. @parcel/types describes the
// Parcel 2 API, whose bundle graph differs (e.g. Parcel 3 assets have no id).
export interface Dependency {
  readonly specifier: string;
  readonly specifierType: 'commonjs' | 'esm' | 'url' | 'custom';
  readonly priority: 'sync' | 'parallel' | 'lazy';
}
export interface Asset {
  /** Includes the query; files on disk use `file:` URLs. */
  readonly url: string;
  readonly filePath: string;
  readonly type: string;
  readonly sideEffects: boolean;
  readonly uniqueKey: string | undefined;
  readonly pipeline: string | undefined;
  getCode(): string;
  getDependencies(): Dependency[];
}
export interface Bundle {
  getEntryAssets(): Asset[];
}
export interface BundleGraph {
  getBundles(): Bundle[];
  getResolvedAsset(dependency: Dependency): Asset | undefined;
}

export function stripQueryParams(id: string): string {
  const idx = id.indexOf('?');
  return idx === -1 ? id : id.slice(0, idx);
}

export function normalize(filePath: string, projectRoot: string): string {
  const stripped = stripQueryParams(filePath);
  // Convert backslashes to forward slashes regardless of platform —
  // path.sep is '/' on Mac/Linux so .split(path.sep) wouldn't catch literal
  // backslashes inside an input string. Universal replace avoids the gap.
  const rel = path.relative(projectRoot, stripped).replace(/\\/g, '/');
  return './' + rel;
}

// Filter Parcel runtime chunks (path may be bare "@parcel/runtime-*" or
// normalized "./node_modules/@parcel/runtime-*"). Also filter the React JSX
// runtime — mirrors builder-vite's filter; means React-version bumps won't
// propagate via stats, but avoids every JSX file having identical noisy reasons.
const FILTER_PATTERNS: RegExp[] = [/@parcel\/runtime-/, /\/react\/jsx-runtime\.js$/];

export function isUserCode(name: string): boolean {
  for (const re of FILTER_PATTERNS) {
    if (re.test(name)) return false;
  }
  return true;
}

// @parcel/resolver-glob resolves each stories glob imported by the generated
// preview-main.js to a virtual glob-<hash>.js module in the same directory.
const STORY_VIRTUAL_RE = /\/storybook-builder-parcel\/generated-entries\/glob-[0-9a-f]+\.js$/;
const CANONICAL_CSF_GLOB = './storybook-stories.js';

export function rewriteStoryVirtuals(statsMap: Map<string, Module>): void {
  for (const [oldName, entry] of [...statsMap]) {
    if (!STORY_VIRTUAL_RE.test(oldName)) continue;
    statsMap.delete(oldName);
    entry.id = CANONICAL_CSF_GLOB;
    entry.name = CANONICAL_CSF_GLOB;
    const existing = statsMap.get(CANONICAL_CSF_GLOB);
    if (existing) {
      for (const r of entry.reasons) {
        if (existing.reasons.every(x => x.moduleName !== r.moduleName)) {
          existing.reasons.push(r);
        }
      }
    } else {
      statsMap.set(CANONICAL_CSF_GLOB, entry);
    }
  }
  for (const entry of statsMap.values()) {
    let rewritten = false;
    for (const reason of entry.reasons) {
      if (STORY_VIRTUAL_RE.test(reason.moduleName)) {
        reason.moduleName = CANONICAL_CSF_GLOB;
        rewritten = true;
      }
    }
    // Story files matched by more than one glob would otherwise list
    // ./storybook-stories.js once per glob.
    if (rewritten) {
      const names = new Set<string>();
      entry.reasons = entry.reasons.filter(r => {
        if (names.has(r.moduleName)) return false;
        names.add(r.moduleName);
        return true;
      });
    }
  }
}

// Parcel 3 assets have no id and the plugin API returns fresh objects on each
// call, so identify assets by URL plus the fields that can split one file into
// several assets (e.g. CSS modules, inline <script>s).
function assetKey(asset: Asset): string {
  return [asset.url, asset.type, asset.uniqueKey ?? '', asset.pipeline ?? ''].join('|');
}

// Parcel 2's bundle graph retargeted imports from side-effect-free modules to the modules
// that define the imported symbols, so barrel files (e.g. a package's exports/index.ts)
// never sat between an importer and what it used. Parcel 3 doesn't, so importing one
// component from a barrel would make the importer depend on everything the barrel
// re-exports. That matters most for .chromatic/custom-addons, which imports Provider from
// two barrels: chromatic-cli bails to a full build when a change reaches the Storybook
// config, so almost every change would.
//
// The plugin API exposes no symbols, so they're recovered from the transformed code,
// which is SWC's CommonJS interop output:
//
//   var _s2 = require("@react-spectrum/s2");                               import binding
//   (0, _s2.Provider)                                                      named import
//   var _fooDefault = parcelHelpers.interopDefault(_foo);                  default import
//   parcelHelpers.export(exports, "Provider", ()=>0, _provider.Provider);  re-export
//
// Any other use of an import binding (e.g. as a namespace) keeps the plain edge, so a change
// in Parcel's output can cost precision but never drop a dependency. As with Parcel 2, a
// change that only re-points one of a barrel's re-exports isn't traced to its importers.

export interface ModuleSymbols {
  /** The names used from each imported specifier, or null if it's used in some other way. */
  imports: Map<string, Set<string> | null>;
  /** Re-exported names, mapped to the specifier and name they're re-exported from. */
  reexports: Map<string, {specifier: string; name: string}>;
}

const IMPORT_RE = /^([ \t]*var )([\w$]+) = require\("((?:[^"\\]|\\.)*)"\);$/gm;
const REQUIRE_RE = /\brequire\("((?:[^"\\]|\\.)*)"\)/g;
const INTEROP_DEFAULT_RE = /^[ \t]*var ([\w$]+) = parcelHelpers\.interopDefault\(([\w$]+)\);$/gm;
const REEXPORT_RE =
  /^[ \t]*parcelHelpers\.export\(exports, "((?:[^"\\]|\\.)*)", \(\)=>\(?0, ([\w$]+)(?:\.([\w$]+)|\["((?:[^"\\]|\\.)*)"\])\)?\);$/gm;
const INTEROP_DEFAULT_CALL = 'parcelHelpers.interopDefault(';

function parseString(literal: string): string | null {
  try {
    return JSON.parse(`"${literal}"`);
  } catch {
    return null;
  }
}

/** Returns null if the code doesn't look like Parcel's output. */
export function parseModuleSymbols(code: string): ModuleSymbols | null {
  const specifiers = new Map<string, string>();
  const declarations = new Set<number>();
  const bindingCounts = new Map<string, number>();
  // The code is printed without hygiene renaming, so e.g. imports from `react` and
  // `./loader/react` can both be bound to `_react`. Uses of such a name can't be attributed,
  // so the imports it's bound to are treated as whole uses.
  const ambiguous = new Set<string>();
  const ambiguousSpecifiers = new Set<string>();
  for (const m of code.matchAll(IMPORT_RE)) {
    const specifier = parseString(m[3]);
    if (specifier == null) return null;
    const previous = specifiers.get(m[2]);
    if (previous != null) {
      ambiguous.add(m[2]);
      ambiguousSpecifiers.add(previous).add(specifier);
    }
    specifiers.set(m[2], specifier);
    declarations.add(m.index! + m[1].length);
    bindingCounts.set(specifier, (bindingCounts.get(specifier) ?? 0) + 1);
  }
  const interopDefaults = new Map<string, string>();
  for (const m of code.matchAll(INTEROP_DEFAULT_RE)) {
    const specifier = specifiers.get(m[1]);
    if (specifier != null) {
      ambiguous.add(m[1]);
      ambiguousSpecifiers.add(specifier);
    }
    interopDefaults.set(m[1], m[2]);
  }
  const imports: ModuleSymbols['imports'] = new Map();
  for (const specifier of bindingCounts.keys()) {
    imports.set(specifier, ambiguousSpecifiers.has(specifier) ? null : new Set());
  }

  // A require() without a binding (e.g. a side-effect import) uses the whole module.
  const requireCounts = new Map<string, number>();
  for (const m of code.matchAll(REQUIRE_RE)) {
    const specifier = parseString(m[1]);
    if (specifier == null) return null;
    requireCounts.set(specifier, (requireCounts.get(specifier) ?? 0) + 1);
  }
  for (const [specifier, count] of requireCounts) {
    if (count > (bindingCounts.get(specifier) ?? 0)) imports.set(specifier, null);
  }

  const unambiguous = [...specifiers.keys()].filter(binding => !ambiguous.has(binding));
  if (unambiguous.length > 0) {
    const bindings = unambiguous.map(b => b.replace(/\$/g, '\\$')).join('|');
    // Group 1 is the preceding character, which tells `obj._foo` apart from `_foo`.
    const useRe = new RegExp(
      `(^|[^\\w$])(${bindings})(?![\\w$])(?:\\.([\\w$]+)|\\["((?:[^"\\\\]|\\\\.)*)"\\])?`,
      'g'
    );
    for (const m of code.matchAll(useRe)) {
      const start = m.index! + m[1].length;
      if (declarations.has(start)) continue;
      const specifier = specifiers.get(m[2])!;
      const used = imports.get(specifier);
      if (!used) continue;
      if (m[1] === '.') {
        // A property named like the binding, unless it's a spread.
        if (code.startsWith('...', start - 3)) imports.set(specifier, null);
        continue;
      }
      let name: string | null = null;
      if (m[3] != null) {
        name = m[3];
      } else if (m[4] != null) {
        name = parseString(m[4]);
      } else if (
        code.startsWith(INTEROP_DEFAULT_CALL, start - INTEROP_DEFAULT_CALL.length) &&
        code[start + m[2].length] === ')'
      ) {
        name = 'default';
      }
      if (name == null) {
        imports.set(specifier, null);
      } else {
        used.add(name);
      }
    }
  }

  const reexports: ModuleSymbols['reexports'] = new Map();
  for (const m of code.matchAll(REEXPORT_RE)) {
    const exported = parseString(m[1]);
    // Exactly one of groups 3 and 4 matches.
    const name = m[3] ?? parseString(m[4]);
    // `_fooDefault.default` re-exports the default import of `_foo`.
    const binding = !specifiers.has(m[2]) && name === 'default' ? interopDefaults.get(m[2]) : m[2];
    // Leaving out a re-export is safe: the name then resolves to the barrel itself.
    const specifier =
      binding == null || ambiguous.has(binding) ? undefined : specifiers.get(binding);
    if (exported != null && name != null && specifier != null) {
      reexports.set(exported, {specifier, name});
    }
  }
  return {imports, reexports};
}

interface ResolvedDependency {
  dependency: Dependency;
  target: Asset;
}

function isStaticImport(dependency: Dependency): boolean {
  return dependency.specifierType === 'esm' && dependency.priority === 'sync';
}

// Imports can only be retargeted past a module that doesn't run code of its own when
// it's imported.
function isSideEffectFreeJs(asset: Asset): boolean {
  return asset.type === 'js' && !asset.sideEffects;
}

function createImportResolver(bundleGraph: BundleGraph) {
  const dependenciesByAsset = new Map<string, ResolvedDependency[]>();
  const symbolsByAsset = new Map<string, ModuleSymbols | null>();
  const exportSources = new Map<string, Asset>();

  function getDependencies(asset: Asset): ResolvedDependency[] {
    const key = assetKey(asset);
    let dependencies = dependenciesByAsset.get(key);
    if (!dependencies) {
      dependencies = [];
      for (const dependency of asset.getDependencies()) {
        const target = bundleGraph.getResolvedAsset(dependency);
        if (target) dependencies.push({dependency, target});
      }
      dependenciesByAsset.set(key, dependencies);
    }
    return dependencies;
  }

  function getSymbols(asset: Asset): ModuleSymbols | null {
    const key = assetKey(asset);
    let symbols = symbolsByAsset.get(key);
    if (symbols === undefined) {
      try {
        symbols = parseModuleSymbols(asset.getCode());
      } catch {
        symbols = null;
      }
      symbolsByAsset.set(key, symbols);
    }
    return symbols;
  }

  function resolveSpecifier(asset: Asset, specifier: string): Asset | null {
    let resolved: Asset | null = null;
    for (const {dependency, target} of getDependencies(asset)) {
      if (dependency.specifier !== specifier || !isStaticImport(dependency)) continue;
      if (resolved && assetKey(resolved) !== assetKey(target)) return null;
      resolved = target;
    }
    return resolved;
  }

  // The module an export of a side-effect-free JS module comes from: the module itself,
  // unless the export is a re-export.
  function resolveExport(asset: Asset, name: string): Asset {
    const key = assetKey(asset) + '\0' + name;
    const cached = exportSources.get(key);
    if (cached) return cached;
    // Re-export cycles resolve to the module itself.
    exportSources.set(key, asset);
    let source = asset;
    const reexport = getSymbols(asset)?.reexports.get(name);
    const reexported = reexport && resolveSpecifier(asset, reexport.specifier);
    if (reexport && reexported) {
      source = isSideEffectFreeJs(reexported)
        ? resolveExport(reexported, reexport.name)
        : reexported;
    }
    exportSources.set(key, source);
    return source;
  }

  // The modules an importer depends on through one of its dependencies.
  function getTargets(importer: Asset, dependency: Dependency, target: Asset): Asset[] {
    if (importer.type !== 'js' || !isStaticImport(dependency) || !isSideEffectFreeJs(target)) {
      return [target];
    }
    const used = getSymbols(importer)?.imports.get(dependency.specifier);
    if (!used || used.size === 0) return [target];
    const targets = new Map<string, Asset>();
    for (const name of used) {
      const source = resolveExport(target, name);
      targets.set(assetKey(source), source);
    }
    return [...targets.values()];
  }

  return {getDependencies, getTargets};
}

export function buildStatsMap(
  bundleGraph: BundleGraph,
  changedAssets: Asset[],
  projectRoot: string
): {statsMap: Map<string, Module>; retargetedImports: number} {
  // Sets keep de-duplicating reasons O(1); some modules (e.g. Parcel's ESM
  // helpers) are imported by thousands of others.
  const reasonsByName = new Map<string, Set<string>>();
  const ensure = (name: string): Set<string> => {
    let reasons = reasonsByName.get(name);
    if (!reasons) {
      reasons = new Set();
      reasonsByName.set(name, reasons);
    }
    return reasons;
  };

  // On a full build changedAssets already contains every asset. Walking from
  // the bundle entries as well keeps the graph complete if that ever changes.
  const stack = [...changedAssets];
  for (const bundle of bundleGraph.getBundles()) {
    stack.push(...bundle.getEntryAssets());
  }
  const resolver = createImportResolver(bundleGraph);
  let retargetedImports = 0;
  const seen = new Set<string>();
  while (stack.length > 0) {
    const asset = stack.pop()!;
    const key = assetKey(asset);
    if (seen.has(key)) continue;
    seen.add(key);

    const assetName = normalize(asset.filePath, projectRoot);
    // Filtered assets are still traversed so their dependencies are reached.
    const recordEdges = isUserCode(assetName);
    if (recordEdges) ensure(assetName);

    // Lazy `import()` dependencies (e.g. glob -> story file) resolve straight
    // to the target asset rather than to a code-splitting runtime.
    for (const {dependency, target} of resolver.getDependencies(asset)) {
      // Visit a bypassed barrel anyway, so modules that only it imports are still listed.
      stack.push(target);
      const targets = resolver.getTargets(asset, dependency, target);
      if (targets.every(t => assetKey(t) !== assetKey(target))) retargetedImports++;
      for (const dep of targets) {
        stack.push(dep);
        if (!recordEdges) continue;
        const depName = normalize(dep.filePath, projectRoot);
        if (!isUserCode(depName)) continue;
        // Skip self-edges. One source file can produce several assets (e.g. CSS
        // modules), which would otherwise list the file as its own reason —
        // harmless (chromatic-cli filters them at getDependentStoryFiles.ts:169)
        // but noisy in the emitted JSON.
        if (depName === assetName) continue;
        ensure(depName).add(assetName);
      }
    }
  }

  const statsMap = new Map<string, Module>();
  for (const [name, reasons] of reasonsByName) {
    statsMap.set(name, {id: name, name, reasons: [...reasons].map(moduleName => ({moduleName}))});
  }
  return {statsMap, retargetedImports};
}

const CSF_GLOB_ENTRY = './parcel-csf-glob.js';

// chromatic-cli's getDependentStoryFiles expects this three-level chain:
//
//     ./storybook-stories.js  ←  (CSF entry, imported by preview-main.js)
//        ↓ imports
//     ./parcel-csf-glob.js    ←  reasons=[storybook-stories.js] → identified as the CSF glob
//        ↓ imports
//     ./Foo.stories.tsx       ←  reasons=[parcel-csf-glob.js]   → added to affectedModuleIds
//
// We discover story files structurally: after buildStatsMap and rewriteStoryVirtuals,
// every story file has './storybook-stories.js' as a reason.
// We rewrite that reason to point at the synthetic ./parcel-csf-glob.js instead.
//
// Pointing story files directly at './storybook-stories.js' would make THEM the
// CSF globs (per getDependentStoryFiles.ts:175-181), causing traceName to bail
// at the story file (line 286) and source files (not story files) to end up
// in affectedModuleIds — which chromatic then can't match to storyIndex entries.
export function addStoryEntries(statsMap: Map<string, Module>): number {
  let tagged = 0;
  for (const entry of statsMap.values()) {
    if (entry.name === CSF_GLOB_ENTRY) continue;
    let rewritten = false;
    for (const reason of entry.reasons) {
      if (reason.moduleName === CANONICAL_CSF_GLOB) {
        reason.moduleName = CSF_GLOB_ENTRY;
        rewritten = true;
      }
    }
    if (rewritten) tagged++;
  }
  if (tagged > 0 && !statsMap.has(CSF_GLOB_ENTRY)) {
    statsMap.set(CSF_GLOB_ENTRY, {
      id: CSF_GLOB_ENTRY,
      name: CSF_GLOB_ENTRY,
      reasons: [{moduleName: CANONICAL_CSF_GLOB}]
    });
  }
  return tagged;
}

export function createStats(statsMap: Map<string, Module>): Stats {
  // Sort modules by name so their order doesn't depend on graph traversal
  // order. chromatic-cli doesn't care about order; this only helps
  // reproducibility for caching/diff use cases.
  const modules = [...statsMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const stats = {modules};

  if (stats.modules.length === 0) {
    throw new Error(
      'parcel-reporter-turbosnap-stats: empty modules array — nothing was traversed.'
    );
  }
  const hasCsfGlob = stats.modules.some(m =>
    m.reasons.some(r => r.moduleName === CANONICAL_CSF_GLOB)
  );
  if (!hasCsfGlob) {
    throw new Error(
      'parcel-reporter-turbosnap-stats: no module references ./storybook-stories.js as a reason. ' +
        'chromatic-cli will hard-error with "Did not find any CSF globs in preview-stats.json". ' +
        'Check that the stories globs in preview-main.js resolved to glob-<hash>.js virtuals and STORY_VIRTUAL_RE matches their filePath.'
    );
  }
  return stats;
}
