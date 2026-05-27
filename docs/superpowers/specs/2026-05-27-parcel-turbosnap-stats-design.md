# Parcel TurboSnap Stats Reporter — Design

**Date:** 2026-05-27
**Status:** Implemented (see addendum below)
**Owner:** Rob Snow

## Implementation addendum (2026-05-27)

Two facts about what shipped that diverge from the spec body below:

1. **Package is published as `@parcel/reporter-turbosnap-stats` (scoped)**, not the unscoped `parcel-reporter-turbosnap-stats` named throughout this doc. The scoped form matches the sibling `@parcel/resolver-storybook` in the same workspace. Parcel's plugin loader accepts either form.

2. **A `addStoryEntries` post-processing helper was added** that is not in the original design. It iterates the stats map after `rewriteStoryVirtuals` and adds `./storybook-stories.js` as a reason on every `.stories.{js,jsx,mjs,ts,tsx}` file. This was discovered during implementation: Parcel's dynamic-import bundle splitting routes `() => import('./Foo.stories.tsx')` through `@parcel/runtime-js` wrappers, so `bundleGraph.getDependencies(syntheticStoriesJs)` resolves to runtime chunks rather than the actual story files — the natural bundle-graph walk doesn't link stories to the CSF-glob anchor. The helper bridges this gap without depending on Parcel internals. The tradeoff: any story file using a non-standard extension or naming convention (e.g., `*.story.tsx`) won't be auto-tagged.

## Summary

Add a Parcel reporter plugin that emits a Chromatic-compatible `preview-stats.json` alongside the Storybook build, enabling TurboSnap (`--only-changed`) for the Parcel-built `.chromatic` and `.chromatic-fc` Storybook configs. The reporter is a single ~150 LOC file modeled directly on `@storybook/builder-vite`'s `webpack-stats-plugin.ts`, with one Parcel-specific concern: rewriting `parcel-resolver-storybook`'s synthetic `stories.js` virtual to TurboSnap's canonical CSF-glob name.

## Problem

The user enabled TurboSnap by adding `--stats-json` to `build:chromatic` / `build:chromatic-fc` and `--only-changed` to the `chromatic` / `chromatic:forced-colors` scripts. The build now fails at the "Prepare your built Storybook" step with:

> Make sure you pass `--stats-json` when building your Storybook.
> Did not find preview-stats.json in your built Storybook.

Root cause: TurboSnap requires the webpack-format `preview-stats.json` produced by Webpack's stats output or by `@storybook/builder-vite`'s port of `vite-plugin-turbosnap`. The repo's Storybook configs use `storybook-react-parcel` → `storybook-builder-parcel`, which has no equivalent. The `--stats-json` flag flows into the Storybook 10 builder option `options.statsJson`, but `storybook-builder-parcel`'s `build()` ignores it and returns `undefined`, so nothing produces the file.

## Approach

**Selected: Option A** — Build a new Parcel reporter plugin that walks Parcel's `BundleGraph` after each build and writes `preview-stats.json` in the shape chromatic-cli's `getDependentStoryFiles` consumes. Register it conditionally on `options.statsJson` in `storybook-builder-parcel`'s `additionalReporters`.

**Rejected alternatives:**

- **Option B (post-build script that translates Parcel's bundle-analyzer JSON):** Bundle-analyzer output is sparser than direct `BundleGraph` access — missing virtual modules and dependency edges. Doesn't fix the underlying builder/Storybook contract gap, so `--stats-json` would still be silently dropped.
- **Option C (inline reporter inside `storybook-builder-parcel`):** Parcel mandates the `parcel-reporter-` package prefix, so this would still require a nested package directory. Less idiomatic given the repo already owns a dozen sibling Parcel plugins under `packages/dev/parcel-*`.

## Research basis

Two independent expert agents audited the upstream sources before this design was finalized. Findings summarized inline below; full agent reports retained in conversation history.

**chromatic-cli's stats consumption** (`chromaui/chromatic-cli` v11.20.0, `node-src/lib/turbosnap/getDependentStoryFiles.ts`, `node-src/types.ts`):

- TurboSnap reads exactly four fields: `stats.modules[].id`, `stats.modules[].name`, `stats.modules[].reasons[].moduleName`, and (optional) `stats.modules[].modules[].name`. No other top-level keys or per-module fields are consumed.
- Hard error (not silent bail) if no module's `reasons[]` contain a known Storybook entry name like `./storybook-stories.js`. `getDependentStoryFiles.ts:201`.
- Bail conditions: changes under `.storybook/` config dir, changes under any `staticDir`, lockfile diff with zero `node_modules/*` modules in stats.
- Path convention: POSIX, `./` prefix, project-root-relative.

**`@storybook/builder-vite`'s solution** (`storybookjs/storybook` next branch, `code/builders/builder-vite/src/plugins/webpack-stats-plugin.ts`):

- ~140 LOC, single self-contained file, originally a port of `vite-plugin-turbosnap`.
- Uses only Rollup's `moduleParsed` hook (push-based). For each parsed module, iterates `mod.importedIds + mod.dynamicallyImportedIds` and registers reverse edges into a `Map`.
- Emits exactly `{modules: [...]}` — nothing else. No `chunks`, `assets`, `entrypoints`, `hash`, `version`, etc.
- Virtual ids must start with `/` to be recognized by chromatic-cli; real paths use `./` prefix.
- Filters out: `vite/` internals, `\0`-prefixed non-Storybook ids, `react/jsx-runtime`.
- Returns data through Storybook 10's `BuilderStats.toJson()` contract; Storybook core writes the file.
- Zero coupling to Vite internals. Tightly coupled to chromatic-cli's expected format — that's the dominant maintenance concern.

## Architecture

```
yarn chromatic
  └─ chromatic-cli
      └─ runs `yarn build:chromatic` (--stats-json flag flows into builder)
          └─ Storybook core
              └─ storybook-builder-parcel.build({options: {statsJson: true, ...}})
                  └─ new Parcel({
                       additionalReporters: [
                         '@parcel/reporter-cli',
                         options.statsJson && 'parcel-reporter-turbosnap-stats',
                       ].filter(Boolean)
                     })
                  └─ parcel.run()
                      └─ ... build phases ...
                      └─ fires 'buildSuccess' event with BundleGraph
                          └─ parcel-reporter-turbosnap-stats
                              ├─ walks BundleGraph (pull-based)
                              ├─ builds Map<id, {id, name, reasons}>
                              ├─ rewrites synthetic stories.js virtual → './storybook-stories.js'
                              ├─ validates (non-empty, CSF-glob anchor present)
                              └─ writes preview-stats.json to bundle.target.distDir
  └─ chromatic-cli reads dist/<sha>/chromatic/preview-stats.json
      └─ TurboSnap maps changed files → affected stories
```

## Components

### New: `packages/dev/parcel-reporter-turbosnap-stats/`

Three files, matching the structure of the existing `packages/dev/parcel-resolver-storybook` sibling.

```
parcel-reporter-turbosnap-stats/
├── package.json       — name: "parcel-reporter-turbosnap-stats" (Parcel-mandated prefix),
│                        private: true, type: module, main: "./index.js"
├── index.js           — re-exports the TS module (matches parcel-resolver-storybook pattern)
└── StatsReporter.ts   — the reporter itself (~150 LOC, ported from
                          builder-vite's webpack-stats-plugin.ts function-for-function)
```

**`StatsReporter.ts` internal surface:**

| Function | Inputs | Output | builder-vite counterpart |
|---|---|---|---|
| `default export` | `Reporter({async report})` from `@parcel/plugin` | n/a | the plugin object literal |
| `stripQueryParams(id)` | string | string | identical to line 38 |
| `isUserCode(id)` | string | boolean | structurally identical; filter set adjusted: `@parcel/runtime-*`, `\0`-prefixed non-storybook, `react/jsx-runtime` |
| `normalize(filePath, root)` | absolute path, project root | POSIX `./rel` or `/virtual:...` | `normalize()` lines 64-91 |
| `buildStatsMap(bundleGraph, root)` | Parcel `BundleGraph`, project root | `Map<id, {id, name, reasons}>` | the `moduleParsed` callback (lines 113-135), but pull-based: iterate `bundleGraph.getBundles()` → `bundle.traverseAssets()` → `bundleGraph.getDependencies(asset)` |
| `rewriteStoryVirtuals(statsMap)` | the map | mutates in place | Parcel-specific (no Vite counterpart) |
| `writeStats(distDir, statsMap, logger)` | output dir, the map, Parcel logger | writes `preview-stats.json`; throws on validation failure | upstream this is Storybook core's job |

**Module/Reason types** are defined inline against chromatic-cli's contract — no separate `.d.ts` exported from this package:

```ts
interface Reason { moduleName: string; }
interface Module { id: string; name: string; reasons: Reason[]; }
```

### Edit: `packages/dev/storybook-builder-parcel/preset.mjs`

Two changes to the existing file:

1. **`package.json`**: add `parcel-reporter-turbosnap-stats` to dependencies.
2. **`preset.mjs:120-141`**: replace the hard-coded `additionalReporters` array with one assembled conditionally based on `options.statsJson`:

```js
const additionalReporters = [
  {packageName: '@parcel/reporter-cli', resolveFrom: __filename}
];
if (options.statsJson) {
  additionalReporters.push({
    packageName: 'parcel-reporter-turbosnap-stats',
    resolveFrom: __filename
  });
}
```

### Not changed

- `.chromatic/main.mjs`, `.chromatic-fc/main.mjs`, `.chromatic/.parcelrc`, `.chromatic-fc/.parcelrc` — reporter is registered at the builder layer, not via `.parcelrc`.
- The existing `--stats-json` and `--only-changed` flags in `package.json` — these already plumb correctly; they just had nowhere to land before.
- `storybook-builder-parcel`'s `build()` return value — the reporter writes the file directly rather than going through Storybook 10's `BuilderStats.toJson()` contract. Storybook core has a `writeStats(directory, 'preview', stats)` utility (`storybookjs/storybook` `core/src/core-server/utils/output-stats.ts:12`) that handles this when a builder returns `previewStats`, but bypassing it avoids tying our output to changes in that utility's filename or formatting conventions.

## Data flow

### Phase A: Graph walk (pull-based)

Parcel's reporter callback receives `event.bundleGraph` with the full graph already resolved. Unlike builder-vite's push-based `moduleParsed` hook, the entire graph is available at once.

```ts
function buildStatsMap(bundleGraph, projectRoot) {
  const statsMap = new Map<string, Module>();
  const ensure = (name) => {
    if (!statsMap.has(name)) statsMap.set(name, {id: name, name, reasons: []});
    return statsMap.get(name);
  };
  const seen = new Set<string>();

  for (const bundle of bundleGraph.getBundles()) {
    bundle.traverseAssets((asset) => {
      if (seen.has(asset.id)) return;
      seen.add(asset.id);

      const assetName = normalize(asset.filePath, projectRoot);
      if (!isUserCode(assetName)) return;
      ensure(assetName);  // every reachable asset gets a record, even leaves

      for (const dep of bundleGraph.getDependencies(asset)) {
        const target = bundleGraph.getResolvedAsset(dep);
        if (!target) continue;
        const depName = normalize(target.filePath, projectRoot);
        if (!isUserCode(depName)) continue;
        const entry = ensure(depName);
        if (entry.reasons.every(r => r.moduleName !== assetName)) {
          entry.reasons.push({moduleName: assetName});
        }
      }
    });
  }
  return statsMap;
}
```

**Invariant:** for every edge `A → B` in the bundle graph, B's `reasons` contains `{moduleName: A}`. This is the inverted graph TurboSnap walks upward from changed files.

### Phase B: Story-virtual rewrite

`parcel-resolver-storybook` creates a synthetic `stories.js` asset for every `story:` glob (`StorybookResolver.ts:49`):

```ts
filePath: path.join(dir, 'stories.js')
```

where `dir` is the directory of whoever imported the `story:` pipeline — for us, `storybook-builder-parcel`'s `generated-entries/`. So in the raw stats it surfaces as e.g. `./packages/dev/storybook-builder-parcel/generated-entries/stories.js`.

TurboSnap requires the CSF-glob entry name to match one of its known patterns (`getDependentStoryFiles.ts:119-135`). We rewrite to the modern Storybook 7+ canonical name:

```ts
const STORY_VIRTUAL_RE = /\/storybook-builder-parcel\/generated-entries\/stories\.js$/;
const CANONICAL = './storybook-stories.js';

function rewriteStoryVirtuals(statsMap) {
  // Rename the virtual entries
  for (const [oldName, entry] of [...statsMap]) {
    if (!STORY_VIRTUAL_RE.test(oldName)) continue;
    statsMap.delete(oldName);
    entry.id = CANONICAL;
    entry.name = CANONICAL;
    // If we already created the canonical entry (from a prior rewrite this build),
    // merge reasons rather than overwrite.
    if (statsMap.has(CANONICAL)) {
      const existing = statsMap.get(CANONICAL);
      for (const r of entry.reasons) {
        if (existing.reasons.every(x => x.moduleName !== r.moduleName)) {
          existing.reasons.push(r);
        }
      }
    } else {
      statsMap.set(CANONICAL, entry);
    }
  }
  // Rewrite any reasons that pointed at the old virtual name
  for (const entry of statsMap.values()) {
    for (const reason of entry.reasons) {
      if (STORY_VIRTUAL_RE.test(reason.moduleName)) {
        reason.moduleName = CANONICAL;
      }
    }
  }
}
```

If multiple `story:` globs in the same config dir produce multiple `stories.js` virtuals (the case for `.chromatic/main.mjs` which has two glob entries), they all collapse to a single `./storybook-stories.js` entry.

### Phase C: Validation + write

`distDir` is sourced from the Parcel build event: `event.bundleGraph.getBundles()[0].target.distDir`. For our single-target builder this is the Storybook output directory (e.g., `dist/<sha>/chromatic/`).

```ts
async function writeStats(distDir, statsMap, logger) {
  const stats = {modules: [...statsMap.values()]};

  if (stats.modules.length === 0) {
    throw new Error('parcel-reporter-turbosnap-stats: empty modules array — nothing was traversed.');
  }
  const hasCsfGlob = stats.modules.some(m =>
    m.reasons.some(r => r.moduleName === './storybook-stories.js')
  );
  if (!hasCsfGlob) {
    throw new Error(
      'parcel-reporter-turbosnap-stats: no module references ./storybook-stories.js as a reason. ' +
      'chromatic-cli will hard-error with "Did not find any CSF globs in preview-stats.json". ' +
      'Check that parcel-resolver-storybook generated a stories.js virtual and STORY_VIRTUAL_RE matches its filePath.'
    );
  }

  await fs.promises.writeFile(
    path.join(distDir, 'preview-stats.json'),
    JSON.stringify(stats)
  );
  logger.info({message: `Wrote preview-stats.json (${stats.modules.length} modules)`});
}
```

### Worked example

Source tree:

```
.chromatic/main.mjs                          (story globs)
packages/foo/chromatic/Button.stories.tsx
packages/foo/src/Button.tsx
```

Resulting `preview-stats.json` (essential entries only):

```json
{
  "modules": [
    {
      "id": "./storybook-stories.js",
      "name": "./storybook-stories.js",
      "reasons": [
        {"moduleName": "./packages/dev/storybook-builder-parcel/generated-entries/preview-main.js"}
      ]
    },
    {
      "id": "./packages/foo/chromatic/Button.stories.tsx",
      "name": "./packages/foo/chromatic/Button.stories.tsx",
      "reasons": [{"moduleName": "./storybook-stories.js"}]
    },
    {
      "id": "./packages/foo/src/Button.tsx",
      "name": "./packages/foo/src/Button.tsx",
      "reasons": [{"moduleName": "./packages/foo/chromatic/Button.stories.tsx"}]
    }
  ]
}
```

A diff that touches `packages/foo/src/Button.tsx` walks: `Button.tsx` → `Button.stories.tsx` → `./storybook-stories.js` (CSF glob match) → Button stories marked affected.

## Error handling

### Failure taxonomy

| Layer | Failure mode | Response |
|---|---|---|
| 1. Reporter setup | Package missing/broken at resolve time | Parcel's reporter loader throws → build fails. No custom handling. |
| 2. Graph walk | `getBundles()` returns empty, malformed Parcel internals | Reporter throws; Parcel surfaces as build error. |
| 3. Data validation | `statsMap` empty, no module has `./storybook-stories.js` reason | Reporter throws with actionable message (Phase C). |
| 4. File I/O | `distDir` not writable, disk full | `fs.writeFile` throws → Parcel surfaces it. |
| 5. Chromatic-side bail | Lockfile diff + no node_modules in stats, change under `.storybook/`, change under `staticDir` | **Not our failure** — documented, not caught. |

### Fail-loudly stance

For layers 2–4, the reporter throws and Parcel propagates. The user sees the failure inline in `yarn chromatic` output before chromatic-cli ever tries to read the file. No silent fallback to "snapshot everything." Decided per user preference.

### Logging

Parcel passes a `logger` to `report()`. Three log lines per build:

```ts
logger.verbose({message: `Building stats from ${bundleCount} bundles, ${assetCount} assets`});
// ... graph walk ...
logger.verbose({message: `Stats map has ${statsMap.size} modules`});
// ... validation, write ...
logger.info({message: `Wrote preview-stats.json (${statsMap.size} modules) to ${distDir}`});
```

Verbose lines render only with `parcel --log-level verbose`. The single `info` line is the normal-build footprint.

### Anti-patterns avoided

- **No try/catch wrapping the graph walk.** Exceptions from Parcel APIs propagate untouched. Masking them as warnings reproduces the exact failure mode TurboSnap users report.
- **No retry on file write.** Disk problems are disk problems.
- **No partial-output fallback.** Empty `modules` is a bug; partial output would be silently wrong.
- **No defensive option-flag checking.** Builder reads `options.statsJson` once at construction; not a moving target.

### Documented bail conditions

A comment block at the top of `StatsReporter.ts` enumerates out-of-scope bails — so a future maintainer hitting "TurboSnap ran but no snapshots saved" knows where to look:

```ts
// TurboSnap may still report 0% reuse for reasons outside this reporter's control:
//   1. Lockfile-only diff with no node_modules in stats — we DO include node_modules,
//      but filter @parcel/runtime-* and react/jsx-runtime (mirrors builder-vite). If
//      a react upgrade fails to propagate, this filter is the suspect.
//   2. Changes under .storybook/ or .chromatic/ — chromatic-cli treats these as
//      Storybook-config changes and bails to full snapshot. By design.
//   3. Changes under any configured staticDir — same bail.
// See chromatic-cli node-src/lib/turbosnap/getDependentStoryFiles.ts lines 250-269.
```

### Filter scope

`isUserCode` mirrors builder-vite's filter set exactly: `@parcel/runtime-*` (instead of `vite/`), `\0`-prefixed non-storybook synthetics, `react/jsx-runtime`. Known dead-zone: changes to `react/jsx-runtime` itself won't propagate. Tradeoff accepted because including it would put every JSX-using module's reasons on it, inflating graph traversal cost.

## Testing

### Layer 1: pure-function unit tests

```
StatsReporter.test.ts
├── normalize()
│   ├── absolute path → './rel' (POSIX, query-stripped)
│   ├── virtual id /storybook-stories.js → stays as '/storybook-stories.js'
│   ├── Windows backslashes → forward slashes
│   └── path with ?query → query stripped
├── isUserCode()
│   ├── './packages/foo/Button.tsx' → true
│   ├── './node_modules/react/index.js' → true (lockfile-bail prevention)
│   ├── './node_modules/react/jsx-runtime.js' → false
│   ├── '@parcel/runtime-js' → false
│   └── '\0synthetic' → false
├── stripQueryParams() — single-line, trivial
└── rewriteStoryVirtuals()
    ├── single stories.js virtual collapses to './storybook-stories.js'
    ├── multiple stories.js virtuals from different glob entries collapse to one
    └── reasons pointing at the old virtual name get rewritten
```

Runs in the repo's existing Jest setup.

### Layer 2: mock-BundleGraph algorithm test

A small mock satisfying the four `BundleGraph` methods (`getBundles`, `traverseAssets`, `getDependencies`, `getResolvedAsset`) — under 30 lines — drives `buildStatsMap` through a hand-crafted graph:

```ts
const mockGraph = makeMockGraph({
  assets: ['./preview-main.js', './stories.js', './Button.stories.tsx', './Button.tsx', './Button.css'],
  edges: [
    ['./preview-main.js', './stories.js'],
    ['./stories.js', './Button.stories.tsx'],
    ['./Button.stories.tsx', './Button.tsx'],
    ['./Button.tsx', './Button.css'],
  ],
});

const statsMap = buildStatsMap(mockGraph, '/proj');
expect(statsMap.get('./Button.tsx').reasons).toEqual([{moduleName: './Button.stories.tsx'}]);
expect(statsMap.get('./Button.css').reasons).toEqual([{moduleName: './Button.tsx'}]);
```

Future Parcel major versions: write a new mock matching the new API; algorithm tests still pass.

### Layer 3: real-Parcel fixture test

One test that runs Parcel against a 3-file fixture project:

```
packages/dev/parcel-reporter-turbosnap-stats/__fixtures__/
├── preview.js               (imports stories.js)
├── Button.stories.tsx       (imports Button.tsx)
└── Button.tsx
```

Drives `new Parcel(...)` with our reporter registered, snapshots the resulting `preview-stats.json`. Catches the case where Parcel's `BundleGraph` API ships a subtle change that breaks our walk. Slow (~5s), excluded from `yarn test:watch`.

### Validation tests

```ts
test('throws when modules array is empty', () => {
  expect(() => writeStats(distDir, new Map())).toThrow(/empty modules array/);
});

test('throws when no CSF-glob anchor is present', () => {
  const map = new Map([['./Foo.tsx', {id: './Foo.tsx', name: './Foo.tsx', reasons: []}]]);
  expect(() => writeStats(distDir, map)).toThrow(/no module references \.\/storybook-stories\.js/);
});
```

### Out of scope

- Diff against builder-vite's actual output. Useful one-time during implementation verification, but not as recurring CI — their format can drift independently.
- TurboSnap reuse percentage. Depends on chromatic-cli logic, current git state, cloud-side computation. Not unit-testable.
- Bail conditions in chromatic-cli. Documented in code, not tested — testing chromatic-cli is them-testing-them.

### Manual verification before merge (one-time)

1. Build a tiny Vite-Storybook with `vite-plugin-turbosnap`, capture its `preview-stats.json`.
2. Build our Parcel-Storybook with the new reporter, capture its `preview-stats.json`.
3. Confirm shapes are equivalent (same field set, path conventions, CSF-glob anchor).
4. Run `yarn chromatic` end-to-end on a branch with a single-file change. Confirm TurboSnap reports non-zero reuse percentage in Chromatic UI.

## Open questions and unknowns

- **Parcel's `bundle.traverseAssets` ordering.** Whether visit order is stable across Parcel versions. Doesn't affect correctness (algorithm is commutative — reasons get accumulated regardless of order) but may affect snapshot test stability. If unstable: sort `statsMap` entries by `name` before write.
- **Multiple Parcel `targets`.** The current builder defines a single `storybook` target. If a future config adds another target, `getBundles()` may include bundles for both. Probably benign (we'd just emit more modules) but worth verifying during implementation.
- **`asset.filePath` for fully-synthetic assets.** `parcel-resolver-storybook` sets `filePath` to a path that doesn't exist on disk. Other resolvers (e.g., the globals resolver at `StorybookResolver.ts:13-17`) do the same with `__dirname + '/globals.js'`. These should pass through `normalize` cleanly but worth empirically confirming.
- **Logger interface stability.** Parcel reporter `logger` shape has been stable but undocumented. Spot-check against the installed Parcel version during implementation.

## References

- Builder-vite stats plugin (template): `.turbosnap-research/storybook/code/builders/builder-vite/src/plugins/webpack-stats-plugin.ts`
- Builder-vite registration: `.turbosnap-research/storybook/code/builders/builder-vite/src/vite-config.ts:96`
- chromatic-cli stats consumption: `chromaui/chromatic-cli` v11.20.0 `node-src/lib/turbosnap/getDependentStoryFiles.ts`, `node-src/types.ts:243-251`
- Parcel reporter API: `@parcel/plugin` `Reporter` class
- Existing repo conventions: `packages/dev/parcel-resolver-storybook/` (peer Parcel plugin)
- Storybook builder API contract: Storybook 10 builders documentation (`https://storybook.js.org/docs/builders/builder-api`)
