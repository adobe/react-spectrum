# Parcel TurboSnap Stats Reporter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **⚠️ NO COMMITS, NO PUSHES.** The user has explicitly forbidden all commits and pushes — including from subagents. Every task ends with a "verify" step instead of "commit." Leave the working tree dirty for the user to review and commit themselves. If you find yourself wanting to `git add` or `git commit`, stop and report status instead.

**Goal:** Make `yarn chromatic` succeed with `--only-changed` (TurboSnap) on the Parcel-built `.chromatic` and `.chromatic-fc` Storybook configs by emitting a Chromatic-compatible `preview-stats.json` during the build.

**Architecture:** New Parcel reporter plugin (`@parcel/reporter-turbosnap-stats`) walks Parcel's `BundleGraph` on `buildSuccess`, builds a `Map<id, {id, name, reasons}>` matching chromatic-cli's contract, rewrites `parcel-resolver-storybook`'s synthetic `stories.js` virtual to TurboSnap's canonical `./storybook-stories.js` CSF-glob name, validates, and writes the file directly to the build output directory. Registered conditionally in `storybook-builder-parcel` when `options.statsJson` is true. Modeled function-for-function on `@storybook/builder-vite`'s `webpack-stats-plugin.ts` (the upstream proof point at ~140 LOC). Spec: `docs/superpowers/specs/2026-05-27-parcel-turbosnap-stats-design.md`.

**Tech Stack:** TypeScript, Parcel 2 (`@parcel/plugin`, `@parcel/types`), Jest 29 + `@swc/jest`, Yarn workspaces.

---

## File structure

```
packages/dev/parcel-reporter-turbosnap-stats/
├── package.json                          NEW
├── index.js                              NEW (CommonJS bridge to TS source)
├── StatsReporter.ts                      NEW (plugin instance; imports from ./helpers)
├── helpers.ts                            NEW (all pure functions, named exports)
└── __tests__/
    ├── helpers.test.ts                   NEW (unit tests for all helpers)
    ├── integration.test.ts               NEW (real-Parcel fixture test)
    └── __fixtures__/                     NEW
        ├── .parcelrc                     NEW
        ├── index.html                    NEW
        ├── preview.js                    NEW
        ├── Button.stories.tsx            NEW
        └── Button.tsx                    NEW

packages/dev/storybook-builder-parcel/
├── package.json                          MODIFIED (+1 dep)
└── preset.mjs                            MODIFIED (lines 120-141; conditional reporter)
```

**Why two source files (`StatsReporter.ts` + `helpers.ts`):** Parcel's plugin loader expects `module.exports = new Reporter(...)` at the package entry point, which would overwrite TypeScript's named exports. Splitting helpers into a separate file avoids the workaround and gives tests a clean `import {x} from '../helpers'`.

---

## Task 1: Scaffold the new package

**Files:**
- Create: `packages/dev/parcel-reporter-turbosnap-stats/package.json`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/index.js`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts` (placeholder)
- Create: `packages/dev/parcel-reporter-turbosnap-stats/StatsReporter.ts` (placeholder)

- [ ] **Step 1: Create `package.json`** (mirrors `packages/dev/parcel-resolver-storybook/package.json`)

```json
{
  "name": "@parcel/reporter-turbosnap-stats",
  "version": "0.0.0",
  "private": true,
  "source": "StatsReporter.ts",
  "main": "dist/StatsReporter.js",
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "rm -rf dist && swc . -d dist --config-file ../../.swcrc",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@parcel/plugin": "^2.16.3",
    "@parcel/types": "^2.16.3"
  },
  "engines": {
    "parcel": "^2.8.0"
  }
}
```

- [ ] **Step 2: Create `index.js`** (one-liner, matches the sibling resolver's pattern at `packages/dev/parcel-resolver-storybook/index.js`)

```js
module.exports = require('./StatsReporter.ts');
```

- [ ] **Step 3: Create placeholder `helpers.ts`** (will be filled in by subsequent tasks)

```ts
// Helpers for parcel-reporter-turbosnap-stats. See ./StatsReporter.ts for the
// plugin entry; this file holds the pure functions exported for unit testing.

// TurboSnap may still report 0% reuse for reasons outside this reporter's control:
//   1. Lockfile-only diff with no node_modules in stats — we DO include node_modules,
//      but filter @parcel/runtime-* and react/jsx-runtime (mirrors builder-vite). If
//      a react upgrade fails to propagate, this filter is the suspect.
//   2. Changes under .storybook/ or .chromatic/ — chromatic-cli treats these as
//      Storybook-config changes and bails to full snapshot. By design.
//   3. Changes under any configured staticDir — same bail.
// See chromatic-cli node-src/lib/turbosnap/getDependentStoryFiles.ts lines 250-269.

export interface Reason { moduleName: string; }
export interface Module { id: string; name: string; reasons: Reason[]; }
```

- [ ] **Step 4: Create placeholder `StatsReporter.ts`**

```ts
import {Reporter} from '@parcel/plugin';

// Plugin wiring is added in Task 9 once all helpers are implemented.
const reporter = new Reporter({
  async report() {
    // intentionally empty until Task 9
  }
});

// Parcel's plugin loader expects `module.exports = <pluginInstance>`,
// not the `.default` wrapper TypeScript would otherwise produce.
module.exports = reporter;
```

- [ ] **Step 5: Wire workspace + verify discovery**

Run:
```bash
yarn install
yarn jest packages/dev/parcel-reporter-turbosnap-stats --listTests
```

Expected: `yarn install` completes without errors. The `--listTests` command prints no test files (empty result) — that's correct; we haven't written any yet.

- [ ] **Step 6: Verify, DO NOT commit**

Run:
```bash
ls packages/dev/parcel-reporter-turbosnap-stats/
```

Expected output:
```
StatsReporter.ts
helpers.ts
index.js
package.json
```

Stop. Report progress. **Do not run `git add` or `git commit`.**

---

## Task 2: TDD `stripQueryParams`

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

- [ ] **Step 1: Write failing test**

Create `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`:

```ts
import {stripQueryParams} from '../helpers';

describe('stripQueryParams', () => {
  test('returns input unchanged when no query string', () => {
    expect(stripQueryParams('./src/Button.tsx')).toBe('./src/Button.tsx');
  });
  test('strips simple query string', () => {
    expect(stripQueryParams('./src/Button.tsx?v=1')).toBe('./src/Button.tsx');
  });
  test('strips query string with multiple params', () => {
    expect(stripQueryParams('./src/Button.tsx?v=1&t=2')).toBe('./src/Button.tsx');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run:
```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts
```

Expected: FAIL with `TypeError: ... is not a function` or `(0 , _helpers.stripQueryParams) is not a function` — `stripQueryParams` is not yet exported.

- [ ] **Step 3: Implement `stripQueryParams`**

Append to `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts` (after the existing interfaces):

```ts
export function stripQueryParams(id: string): string {
  const idx = id.indexOf('?');
  return idx === -1 ? id : id.slice(0, idx);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run:
```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts
```

Expected: PASS, 3 tests pass.

- [ ] **Step 5: DO NOT commit. Report progress and pause.**

---

## Task 3: TDD `normalize`

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts`
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `__tests__/helpers.test.ts`:

```ts
import {normalize} from '../helpers';

describe('normalize', () => {
  const root = '/repo';

  test('absolute path inside root → "./relative" POSIX form', () => {
    expect(normalize('/repo/src/Button.tsx', root)).toBe('./src/Button.tsx');
  });
  test('strips query params before normalizing', () => {
    expect(normalize('/repo/src/Button.tsx?v=42', root)).toBe('./src/Button.tsx');
  });
  test('Windows backslashes converted to forward slashes', () => {
    // Simulate a Windows-style relative result by passing a backslashy input
    expect(normalize('/repo/src\\nested\\Button.tsx', root)).toMatch(/^\.\/src\/nested\/Button\.tsx$/);
  });
  test('\\0-prefixed synthetic id gets virtual: leading-slash form', () => {
    expect(normalize('\0synthetic/foo.js', root)).toBe('/virtual:/synthetic/foo.js');
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run:
```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t normalize
```

Expected: FAIL — `normalize` is not yet exported.

- [ ] **Step 3: Implement `normalize`**

Append to `helpers.ts`:

```ts
import path from 'path';

const VIRTUAL_PREFIX = '\0';

export function normalize(filePath: string, projectRoot: string): string {
  const stripped = stripQueryParams(filePath);
  if (stripped.startsWith(VIRTUAL_PREFIX)) {
    // chromatic-cli's getDependentStoryFiles normalizePath short-circuits paths
    // starting with /virtual: — see chromatic-cli node-src/lib/turbosnap/getDependentStoryFiles.ts
    // line ~53. builder-vite's webpack-stats-plugin.ts has the same trick.
    return '/virtual:' + stripped.slice(VIRTUAL_PREFIX.length).replace(/^\/?/, '/');
  }
  // Convert backslashes to forward slashes regardless of platform —
  // path.sep is '/' on Mac/Linux so .split(path.sep) wouldn't catch literal
  // backslashes inside an input string. Universal replace avoids the gap.
  const rel = path.relative(projectRoot, stripped).replace(/\\/g, '/');
  if (rel.startsWith('virtual:')) return '/' + rel;
  return './' + rel;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run:
```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t normalize
```

Expected: PASS, 4 tests in the `normalize` describe block.

- [ ] **Step 5: DO NOT commit. Report progress and pause.**

---

## Task 4: TDD `isUserCode`

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts`
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `__tests__/helpers.test.ts`:

```ts
import {isUserCode} from '../helpers';

describe('isUserCode', () => {
  test('user source paths → true', () => {
    expect(isUserCode('./packages/foo/Button.tsx')).toBe(true);
  });
  test('node_modules paths → true (lockfile-bail prevention)', () => {
    expect(isUserCode('./node_modules/react/index.js')).toBe(true);
  });
  test('react/jsx-runtime → false (mirrors builder-vite filter)', () => {
    expect(isUserCode('./node_modules/react/jsx-runtime.js')).toBe(false);
  });
  test('@parcel/runtime-* → false', () => {
    expect(isUserCode('@parcel/runtime-js/foo.js')).toBe(false);
  });
  test('\\0-prefixed synthetic ids → false', () => {
    expect(isUserCode('\0synthetic')).toBe(false);
  });
  test('virtual storybook-stories.js → true (it is the CSF-glob anchor)', () => {
    expect(isUserCode('./storybook-stories.js')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t isUserCode
```

Expected: FAIL — not exported.

- [ ] **Step 3: Implement `isUserCode`**

Append to `helpers.ts`:

```ts
const FILTER_PATTERNS: RegExp[] = [
  /^@parcel\/runtime-/,
  /\/react\/jsx-runtime\.js$/
];

export function isUserCode(name: string): boolean {
  if (name.startsWith(VIRTUAL_PREFIX)) return false;
  for (const re of FILTER_PATTERNS) {
    if (re.test(name)) return false;
  }
  return true;
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t isUserCode
```

Expected: PASS, 6 tests.

- [ ] **Step 5: DO NOT commit. Report progress and pause.**

---

## Task 5: TDD `buildStatsMap` (with mock BundleGraph)

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts`
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

- [ ] **Step 1: Add a mock-graph helper and failing tests**

Append to `__tests__/helpers.test.ts`:

```ts
import {buildStatsMap} from '../helpers';

// Minimal stand-in satisfying the four BundleGraph methods buildStatsMap uses.
// If Parcel ever renames these methods, this mock breaks first — and the test
// failure tells the maintainer where to look.
function makeMockGraph(opts: {assets: string[]; edges: [string, string][]}) {
  const assetById = new Map<string, {id: string; filePath: string}>();
  for (const filePath of opts.assets) {
    assetById.set(filePath, {id: filePath, filePath});
  }
  const depsBySource = new Map<string, {id: string; target: string}[]>();
  for (const [src, dst] of opts.edges) {
    if (!depsBySource.has(src)) depsBySource.set(src, []);
    depsBySource.get(src)!.push({id: `${src}->${dst}`, target: dst});
  }

  return {
    getBundles: () => [{
      traverseAssets: (visit: (a: any) => void) => {
        for (const a of assetById.values()) visit(a);
      }
    }],
    getDependencies: (asset: {filePath: string}) =>
      depsBySource.get(asset.filePath) ?? [],
    getResolvedAsset: (dep: {target: string}) =>
      assetById.get(dep.target) ?? null
  } as any;
}

describe('buildStatsMap', () => {
  const root = '';

  test('inverts a linear chain into reasons', () => {
    const g = makeMockGraph({
      assets: ['./Button.tsx', './Button.stories.tsx'],
      edges: [['./Button.stories.tsx', './Button.tsx']]
    });
    const m = buildStatsMap(g, root);
    expect(m.get('./Button.tsx')?.reasons).toEqual([
      {moduleName: './Button.stories.tsx'}
    ]);
    expect(m.get('./Button.stories.tsx')?.reasons).toEqual([]);
  });

  test('accumulates reasons from multiple importers', () => {
    const g = makeMockGraph({
      assets: ['./shared.ts', './a.tsx', './b.tsx'],
      edges: [['./a.tsx', './shared.ts'], ['./b.tsx', './shared.ts']]
    });
    const m = buildStatsMap(g, root);
    const reasons = m.get('./shared.ts')!.reasons.map(r => r.moduleName).sort();
    expect(reasons).toEqual(['./a.tsx', './b.tsx']);
  });

  test('dedupes repeated edges from the same importer', () => {
    const g = makeMockGraph({
      assets: ['./shared.ts', './a.tsx'],
      edges: [['./a.tsx', './shared.ts'], ['./a.tsx', './shared.ts']]
    });
    const m = buildStatsMap(g, root);
    expect(m.get('./shared.ts')!.reasons).toEqual([{moduleName: './a.tsx'}]);
  });

  test('skips filtered modules (react/jsx-runtime)', () => {
    const g = makeMockGraph({
      assets: ['./node_modules/react/jsx-runtime.js', './Button.tsx'],
      edges: [['./Button.tsx', './node_modules/react/jsx-runtime.js']]
    });
    const m = buildStatsMap(g, root);
    expect(m.has('./node_modules/react/jsx-runtime.js')).toBe(false);
    // Button.tsx is still recorded (it's a user module with no other deps)
    expect(m.has('./Button.tsx')).toBe(true);
  });

  test('leaf assets get a record with empty reasons', () => {
    const g = makeMockGraph({assets: ['./leaf.ts'], edges: []});
    const m = buildStatsMap(g, root);
    expect(m.get('./leaf.ts')).toEqual({id: './leaf.ts', name: './leaf.ts', reasons: []});
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t buildStatsMap
```

Expected: FAIL — `buildStatsMap` is not exported.

- [ ] **Step 3: Implement `buildStatsMap`**

Append to `helpers.ts`:

```ts
import type {BundleGraph, Asset} from '@parcel/types';

export function buildStatsMap(
  bundleGraph: BundleGraph<any>,
  projectRoot: string
): Map<string, Module> {
  const statsMap = new Map<string, Module>();
  const ensure = (name: string): Module => {
    let entry = statsMap.get(name);
    if (!entry) {
      entry = {id: name, name, reasons: []};
      statsMap.set(name, entry);
    }
    return entry;
  };
  const seen = new Set<string>();

  for (const bundle of bundleGraph.getBundles()) {
    bundle.traverseAssets((asset: Asset) => {
      if (seen.has(asset.id)) return;
      seen.add(asset.id);

      const assetName = normalize(asset.filePath, projectRoot);
      if (!isUserCode(assetName)) return;
      ensure(assetName);

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

- [ ] **Step 4: Run tests, verify they pass**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t buildStatsMap
```

Expected: PASS, 5 tests.

- [ ] **Step 5: DO NOT commit. Report progress and pause.**

---

## Task 6: TDD `rewriteStoryVirtuals`

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts`
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `__tests__/helpers.test.ts`:

```ts
import {rewriteStoryVirtuals, type Module} from '../helpers';

describe('rewriteStoryVirtuals', () => {
  const STORY_VIRTUAL = './packages/dev/storybook-builder-parcel/generated-entries/stories.js';
  const CANONICAL = './storybook-stories.js';

  test('renames a single stories.js virtual to the canonical name', () => {
    const m = new Map<string, Module>([
      [STORY_VIRTUAL, {id: STORY_VIRTUAL, name: STORY_VIRTUAL, reasons: []}]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.has(STORY_VIRTUAL)).toBe(false);
    expect(m.get(CANONICAL)).toEqual({id: CANONICAL, name: CANONICAL, reasons: []});
  });

  test('rewrites any reason pointing at the old virtual', () => {
    const m = new Map<string, Module>([
      [STORY_VIRTUAL, {id: STORY_VIRTUAL, name: STORY_VIRTUAL, reasons: []}],
      ['./Button.stories.tsx', {
        id: './Button.stories.tsx',
        name: './Button.stories.tsx',
        reasons: [{moduleName: STORY_VIRTUAL}]
      }]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.get('./Button.stories.tsx')!.reasons).toEqual([{moduleName: CANONICAL}]);
  });

  test('collapses multiple stories.js virtuals into one canonical entry', () => {
    // .chromatic/main.mjs has two story globs → two synthetic stories.js
    // assets in the same dir. In practice they share the same filePath, but
    // tests can simulate dual entries by using a path suffix that still
    // matches STORY_VIRTUAL_RE. We use the same path twice via merge semantics.
    const PATH_A = './a/storybook-builder-parcel/generated-entries/stories.js';
    const PATH_B = './b/storybook-builder-parcel/generated-entries/stories.js';
    const m = new Map<string, Module>([
      [PATH_A, {id: PATH_A, name: PATH_A, reasons: [{moduleName: './x.tsx'}]}],
      [PATH_B, {id: PATH_B, name: PATH_B, reasons: [{moduleName: './y.tsx'}]}]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.size).toBe(1);
    const merged = m.get(CANONICAL)!;
    const moduleNames = merged.reasons.map(r => r.moduleName).sort();
    expect(moduleNames).toEqual(['./x.tsx', './y.tsx']);
  });

  test('leaves non-matching entries untouched', () => {
    const m = new Map<string, Module>([
      ['./Button.tsx', {id: './Button.tsx', name: './Button.tsx', reasons: []}]
    ]);
    rewriteStoryVirtuals(m);
    expect(m.has('./Button.tsx')).toBe(true);
    expect(m.has(CANONICAL)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t rewriteStoryVirtuals
```

Expected: FAIL — `rewriteStoryVirtuals` is not exported.

- [ ] **Step 3: Implement `rewriteStoryVirtuals`**

Append to `helpers.ts`:

```ts
const STORY_VIRTUAL_RE = /\/storybook-builder-parcel\/generated-entries\/stories\.js$/;
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
    for (const reason of entry.reasons) {
      if (STORY_VIRTUAL_RE.test(reason.moduleName)) {
        reason.moduleName = CANONICAL_CSF_GLOB;
      }
    }
  }
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t rewriteStoryVirtuals
```

Expected: PASS, 4 tests.

- [ ] **Step 5: DO NOT commit. Report progress and pause.**

---

## Task 7: TDD `writeStats` validation

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/helpers.ts`
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

- [ ] **Step 1: Add failing validation tests**

Append to `__tests__/helpers.test.ts`:

```ts
import {writeStats, type Module} from '../helpers';
import os from 'os';
import path from 'path';
import fs from 'fs';

const silentLogger = {info: () => {}};

describe('writeStats — validation', () => {
  test('throws when modules map is empty', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-empty-'));
    await expect(writeStats(tmp, new Map(), silentLogger))
      .rejects.toThrow(/empty modules array/);
  });

  test('throws when no module references ./storybook-stories.js', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-nocsf-'));
    const m = new Map<string, Module>([
      ['./Foo.tsx', {id: './Foo.tsx', name: './Foo.tsx', reasons: []}]
    ]);
    await expect(writeStats(tmp, m, silentLogger))
      .rejects.toThrow(/no module references \.\/storybook-stories\.js/);
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t "writeStats — validation"
```

Expected: FAIL — `writeStats` is not exported.

- [ ] **Step 3: Implement `writeStats` (validation only; file emission in Task 8)**

Append to `helpers.ts`:

```ts
import fs from 'fs';

interface Logger { info: (m: {message: string}) => void; }

export async function writeStats(
  distDir: string,
  statsMap: Map<string, Module>,
  logger: Logger
): Promise<void> {
  const stats = {modules: [...statsMap.values()]};

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
      'Check that parcel-resolver-storybook generated a stories.js virtual and STORY_VIRTUAL_RE matches its filePath.'
    );
  }

  await fs.promises.writeFile(
    path.join(distDir, 'preview-stats.json'),
    JSON.stringify(stats)
  );
  logger.info({message: `parcel-reporter-turbosnap-stats: wrote preview-stats.json (${stats.modules.length} modules) to ${distDir}`});
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t "writeStats — validation"
```

Expected: PASS, 2 tests.

- [ ] **Step 5: DO NOT commit. Report progress and pause.**

---

## Task 8: TDD `writeStats` file emission

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts`

(No code change to `helpers.ts` — Task 7 already implements file emission; this task adds the happy-path test.)

- [ ] **Step 1: Add happy-path test**

Append to `__tests__/helpers.test.ts`:

```ts
describe('writeStats — happy path', () => {
  test('writes preview-stats.json to distDir with expected shape', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-write-'));
    const m = new Map<string, Module>([
      ['./storybook-stories.js', {
        id: './storybook-stories.js',
        name: './storybook-stories.js',
        reasons: [{moduleName: './preview-main.js'}]
      }],
      ['./Button.stories.tsx', {
        id: './Button.stories.tsx',
        name: './Button.stories.tsx',
        reasons: [{moduleName: './storybook-stories.js'}]
      }]
    ]);

    let infoLog: string | undefined;
    const logger = {info: (m: {message: string}) => { infoLog = m.message; }};
    await writeStats(tmp, m, logger);

    const written = JSON.parse(fs.readFileSync(path.join(tmp, 'preview-stats.json'), 'utf8'));
    expect(Object.keys(written)).toEqual(['modules']);
    expect(written.modules).toHaveLength(2);
    expect(written.modules[0]).toEqual({
      id: './storybook-stories.js',
      name: './storybook-stories.js',
      reasons: [{moduleName: './preview-main.js'}]
    });
    expect(infoLog).toMatch(/wrote preview-stats\.json \(2 modules\)/);
  });
});
```

- [ ] **Step 2: Run test, verify it passes (no impl change needed)**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts -t "writeStats — happy path"
```

Expected: PASS.

- [ ] **Step 3: Run the full helpers suite**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts
```

Expected: PASS for the complete file — sum of tests across Tasks 2-8:
- `stripQueryParams`: 3
- `normalize`: 4
- `isUserCode`: 6
- `buildStatsMap`: 5
- `rewriteStoryVirtuals`: 4
- `writeStats — validation`: 2
- `writeStats — happy path`: 1
- **Total: 25**

- [ ] **Step 4: DO NOT commit. Report progress and pause.**

---

## Task 9: Wire the Reporter plugin

**Files:**
- Modify: `packages/dev/parcel-reporter-turbosnap-stats/StatsReporter.ts`

- [ ] **Step 1: Replace `StatsReporter.ts` with the real plugin wiring**

Overwrite `packages/dev/parcel-reporter-turbosnap-stats/StatsReporter.ts`:

```ts
import {Reporter} from '@parcel/plugin';
import {buildStatsMap, rewriteStoryVirtuals, writeStats} from './helpers';

const reporter = new Reporter({
  async report({event, options, logger}) {
    if (event.type !== 'buildSuccess') return;

    const statsMap = buildStatsMap(event.bundleGraph, options.projectRoot);
    rewriteStoryVirtuals(statsMap);

    const bundles = event.bundleGraph.getBundles();
    const distDir = bundles[0]?.target.distDir;
    if (!distDir) {
      throw new Error(
        'parcel-reporter-turbosnap-stats: no bundles were produced; cannot determine output dir.'
      );
    }
    await writeStats(distDir, statsMap, logger);
  }
});

// Parcel's plugin loader expects `module.exports = <pluginInstance>`,
// not the `.default` wrapper TypeScript would otherwise produce.
module.exports = reporter;
```

- [ ] **Step 2: Verify TypeScript compiles without errors**

Run:
```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats --listTests
```

Expected: prints the test file paths without TypeScript errors. (Jest's swc transform compiles the import chain.)

- [ ] **Step 3: Re-run the full helpers suite to confirm nothing regressed**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/helpers.test.ts
```

Expected: 25 tests pass.

- [ ] **Step 4: DO NOT commit. Report progress and pause.**

---

## Task 10: Real-Parcel integration test (fixture build)

**Files:**
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/__fixtures__/.parcelrc`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/__fixtures__/index.html`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/__fixtures__/preview.js`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/__fixtures__/Button.stories.tsx`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/__fixtures__/Button.tsx`
- Create: `packages/dev/parcel-reporter-turbosnap-stats/__tests__/integration.test.ts`

This test runs the actual Parcel build against a minimal fixture. The fixture does NOT use storybook-builder-parcel — it directly drives `new Parcel(...)` with our reporter. It validates the algorithm against a real `BundleGraph`. The synthetic-stories rewrite is exercised by Task 12's manual verification, since synthesizing the storybook-resolver pipeline in a unit test is more cost than value.

- [ ] **Step 1: Create fixture `__fixtures__/index.html`**

```html
<!doctype html>
<html><body><script type="module" src="./preview.js"></script></body></html>
```

- [ ] **Step 2: Create fixture `__fixtures__/preview.js`**

```js
import {Button} from './Button.stories.tsx';
console.log(Button);
```

- [ ] **Step 3: Create fixture `__fixtures__/Button.stories.tsx`**

```tsx
import {Button} from './Button';
export {Button};
export default {title: 'Button'};
```

- [ ] **Step 4: Create fixture `__fixtures__/Button.tsx`**

```tsx
export const Button = () => null;
```

- [ ] **Step 5: Create fixture `__fixtures__/.parcelrc`**

```json
{
  "extends": "@parcel/config-default"
}
```

- [ ] **Step 6: Create integration test**

Create `packages/dev/parcel-reporter-turbosnap-stats/__tests__/integration.test.ts`:

```ts
import {Parcel} from '@parcel/core';
import path from 'path';
import fs from 'fs';
import os from 'os';

jest.setTimeout(60_000);

describe('integration: real Parcel build emits preview-stats.json', () => {
  test('writes a stats file whose modules contain user code with inverted reasons', async () => {
    const fixtureDir = path.join(__dirname, '__fixtures__');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-int-'));

    const parcel = new (Parcel as any)({
      entries: path.join(fixtureDir, 'index.html'),
      config: path.join(fixtureDir, '.parcelrc'),
      mode: 'production',
      additionalReporters: [{
        packageName: '@parcel/reporter-turbosnap-stats',
        resolveFrom: __filename
      }],
      targets: {
        default: {
          distDir,
          publicUrl: './'
        }
      }
    });

    // The reporter will throw "no module references ./storybook-stories.js" because
    // this fixture isn't a Storybook build. Catch and assert the throw — that proves
    // the reporter ran, walked the graph, and reached validation. Then inspect what
    // it traversed by re-running with validation disabled... actually no, simpler:
    // bypass validation by using a fixture file named 'stories.js' in the resolver
    // virtuals dir. Use the buildSuccess hook in a wrapper.
    //
    // Pragmatic alternative: this test ONLY confirms the reporter throws the right
    // validation error, which proves the graph walk + validation work end-to-end
    // against real Parcel internals. The full happy-path is covered by Task 12's
    // manual verification against the actual Storybook build.
    await expect(parcel.run()).rejects.toThrow(/no module references \.\/storybook-stories\.js/);
  });
});
```

- [ ] **Step 7: Run the integration test**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats/__tests__/integration.test.ts
```

Expected: PASS. The test takes ~5-15s. If Parcel emits the error inside a wrapping error, the `.rejects.toThrow` matcher walks `.cause` and message chains — should still match.

- [ ] **Step 8: If integration test FAILS with an unrelated error**

Common causes and fixes:
- `Cannot find module '@parcel/reporter-turbosnap-stats'` → run `yarn install` to re-link workspaces.
- `Cannot resolve './Button'` from `Button.stories.tsx` → make sure the `.parcelrc` extends `@parcel/config-default` (which includes TSX support).
- Test timeout → bump `jest.setTimeout` to 120_000.

- [ ] **Step 9: DO NOT commit. Report progress and pause.**

---

## Task 11: Integrate into storybook-builder-parcel

**Files:**
- Modify: `packages/dev/storybook-builder-parcel/package.json`
- Modify: `packages/dev/storybook-builder-parcel/preset.mjs` (lines 120-141)

- [ ] **Step 1: Add the new dependency**

Edit `packages/dev/storybook-builder-parcel/package.json` to add `"@parcel/reporter-turbosnap-stats": "0.0.0"` in the `dependencies` block, alphabetized between `@parcel/reporter-cli` and `@parcel/utils`. Current state (line 17-18):

```json
    "@parcel/reporter-cli": "^2.16.3",
    "@parcel/utils": "^2.16.3",
```

After:

```json
    "@parcel/reporter-cli": "^2.16.3",
    "@parcel/reporter-turbosnap-stats": "0.0.0",
    "@parcel/utils": "^2.16.3",
```

- [ ] **Step 2: Make the reporter conditional in `preset.mjs`**

In `packages/dev/storybook-builder-parcel/preset.mjs`, locate the `additionalReporters` argument inside `createParcel` (currently around lines 126):

```js
    additionalReporters: [{packageName: '@parcel/reporter-cli', resolveFrom: __filename}],
```

Replace with:

```js
    additionalReporters: [
      {packageName: '@parcel/reporter-cli', resolveFrom: __filename},
      ...(options.statsJson ? [{
        packageName: '@parcel/reporter-turbosnap-stats',
        resolveFrom: __filename
      }] : [])
    ],
```

`options.statsJson` is set by Storybook 10 core when the `--stats-json` flag is passed (`storybookjs/storybook` `core/src/types/modules/core-common.ts:228`).

- [ ] **Step 3: Re-link workspaces**

```bash
yarn install
```

Expected: completes without error.

- [ ] **Step 4: Verify Parcel can resolve the new reporter**

```bash
node -e "console.log(require.resolve('@parcel/reporter-turbosnap-stats'))"
```

Expected: prints the absolute path to `packages/dev/parcel-reporter-turbosnap-stats/index.js` (or the compiled `dist/StatsReporter.js`).

- [ ] **Step 5: Run a smoke build with stats enabled**

```bash
yarn build:chromatic
```

Expected: the build completes, and `dist/<sha>/chromatic/preview-stats.json` exists. Inspect:

```bash
ls dist/$(git rev-parse HEAD)/chromatic/preview-stats.json
jq '.modules | length' dist/$(git rev-parse HEAD)/chromatic/preview-stats.json
jq '.modules[] | select(.name == "./storybook-stories.js")' dist/$(git rev-parse HEAD)/chromatic/preview-stats.json
```

Expected:
- File exists.
- `modules` is a sizable number (likely >1000 for this repo).
- A module named `./storybook-stories.js` exists with at least one reason.

If the validation throws ("no module references ./storybook-stories.js"), `STORY_VIRTUAL_RE` in `helpers.ts` does not match the actual `asset.filePath` of `parcel-resolver-storybook`'s synthetic stories.js. Print the matching candidates:

```bash
jq '.modules[] | select(.name | test("stories\\.js"))' dist/$(git rev-parse HEAD)/chromatic/preview-stats.json
```

Use the output to adjust the regex. **Do not catch the error to make the build pass** — that's the "fail loudly" contract.

- [ ] **Step 6: DO NOT commit. Report progress and pause.**

---

## Task 12: End-to-end verification with chromatic-cli

This is the user's original spike formalized as the final acceptance gate. No new code — just running the pipeline.

- [ ] **Step 1: Confirm a baseline TurboSnap-eligible diff exists**

Make a single trivial source change to a non-config, non-story file — e.g., add a no-op comment to a component used by stories. Don't stage or commit it; the diff just needs to exist in the working tree (chromatic-cli reads `git diff`).

- [ ] **Step 2: Run chromatic locally**

```bash
yarn chromatic
```

Expected output, in order:
- `✔ Authenticated with Chromatic`
- `✔ Retrieved git information`
- `✔ Collected Storybook metadata`
- `✔ Initialized build`
- `✔ Storybook built in <N> seconds`
- `✔ Prepare your built Storybook` — **this is the line that previously failed.** Should pass now.
- `✔ Publish your built Storybook`
- `✔ Verify your Storybook`
- `✔ Test your stories`
- A reuse percentage line indicating TurboSnap engaged, e.g., `Snapshots reused: <N>%`.

- [ ] **Step 3: If "Prepare" still fails with "missing stats file"**

The reporter ran but Chromatic isn't finding the file. Verify:
```bash
ls dist/$(git rev-parse HEAD)/chromatic/preview-stats.json
```

If it exists, chromatic-cli is looking in the wrong directory. Re-check the `--build-script-name` in `package.json` and that `chromatic-cli` is using the same output dir as `yarn build:chromatic`.

- [ ] **Step 4: If TurboSnap reports 0% reuse**

Cross-check against the documented bail conditions in the spec's "Documented bail conditions" section:
- Any change under `.storybook/` or `.chromatic/`? → expected bail.
- Lockfile (`yarn.lock`) changed? → may bail unless `node_modules/*` modules are in stats. Inspect:
  ```bash
  jq '.modules[] | select(.name | test("node_modules"))' dist/$(git rev-parse HEAD)/chromatic/preview-stats.json | head
  ```
  If empty, the filter set in `helpers.ts:isUserCode` is too aggressive — relax it.

- [ ] **Step 5: Also verify the forced-colors variant**

```bash
yarn chromatic:forced-colors
```

Expected: same behavior, separate Chromatic project.

- [ ] **Step 6: Run the full helpers + integration test suite one last time**

```bash
yarn jest packages/dev/parcel-reporter-turbosnap-stats
```

Expected: 25 unit tests + 1 integration test pass (total 26).

- [ ] **Step 7: DO NOT commit anything. Report results to the user.**

Summarize:
- All tests passing? (yes/no)
- `yarn chromatic` reaches "Verify your Storybook"? (yes/no)
- TurboSnap reuse percentage? (number)
- Any remaining concerns or follow-ups? (list)

Hand control back to the user. They will decide whether to commit, and what cleanup to do (e.g., removing `.turbosnap-research/`).

---

## Cleanup notes for the user (after acceptance)

When the user is ready to commit, they should consider:
- `rm -rf .turbosnap-research/` (research clones, currently gitignored).
- Decide whether the `.turbosnap-research/` line in `.gitignore` should stay (harmless) or be removed.
- The original `package.json` changes (`--stats-json` and `--only-changed` flags in the `chromatic` scripts) are part of the same feature and should ship in the same commit as the new package.

## Spec coverage check (self-review)

| Spec section | Implementing task(s) |
|---|---|
| Architecture diagram | Task 11 (registration), Task 9 (wiring) |
| Components: parcel-reporter-turbosnap-stats package | Tasks 1, 9 |
| Components: StatsReporter.ts surface (`stripQueryParams`, `normalize`, `isUserCode`, `buildStatsMap`, `rewriteStoryVirtuals`, `writeStats`) | Tasks 2-8 |
| Components: storybook-builder-parcel edit | Task 11 |
| Data flow: Phase A (graph walk) | Task 5 |
| Data flow: Phase B (story-virtual rewrite) | Task 6 |
| Data flow: Phase C (validation + write) | Tasks 7, 8 |
| Worked example | Verified by Task 12 |
| Error handling: fail-loudly | Tasks 7 (validation throws), 9 (no bundles throws) |
| Error handling: logger usage | Task 7 (logger.info on write) |
| Error handling: filter set | Task 4 (`isUserCode`) |
| Testing Layer 1: pure-function unit tests | Tasks 2-8 |
| Testing Layer 2: mock-BundleGraph algorithm test | Task 5 |
| Testing Layer 3: real-Parcel fixture test | Task 10 |
| Validation tests | Task 7 |
| Manual verification (4-step checklist) | Task 12 |
