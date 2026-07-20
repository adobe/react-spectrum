// Helpers for parcel-reporter-turbosnap-stats. See ./StatsReporter.ts for the
// plugin entry; this file holds the pure functions exported for unit testing.

import type {Asset, BundleGraph, FileSystem} from '@parcel/types';
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
        // resolveAsyncDependency unwraps Parcel's @parcel/runtime-js code-splitting
        // wrappers for `() => import('...')` deps so the edge points at the real
        // target asset (e.g. ./Foo.stories.tsx) instead of the runtime chunk.
        // Returns null for sync deps; fall back to getResolvedAsset there.
        const asyncResult = bundleGraph.resolveAsyncDependency(dep, bundle);
        let target: Asset | null | undefined;
        if (asyncResult) {
          target =
            asyncResult.type === 'asset'
              ? asyncResult.value
              : bundleGraph.getAssetById(asyncResult.value.entryAssetId);
        } else {
          target = bundleGraph.getResolvedAsset(dep, bundle);
        }
        if (!target) continue;
        const depName = normalize(target.filePath, projectRoot);
        if (!isUserCode(depName)) continue;
        // Skip self-edges. Parcel sometimes emits multiple Asset objects for the
        // same source file (e.g., a transformer's sibling output, HMR runtime
        // injection), giving them distinct asset.id values but identical filePath.
        // Without this guard those collapse into "TagGroup.tsx is a reason for
        // TagGroup.tsx" entries — harmless (chromatic-cli filters them at
        // getDependentStoryFiles.ts:169) but noisy in the emitted JSON.
        if (depName === assetName) continue;
        const entry = ensure(depName);
        if (entry.reasons.every(r => r.moduleName !== assetName)) {
          entry.reasons.push({moduleName: assetName});
        }
      }
    });
  }
  return statsMap;
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
// We discover story files structurally: after buildStatsMap (with resolveAsyncDependency)
// and rewriteStoryVirtuals, every story file has './storybook-stories.js' as a reason.
// We rewrite that reason to point at the synthetic ./parcel-csf-glob.js instead.
//
// Pointing story files directly at './storybook-stories.js' would make THEM the
// CSF globs (per getDependentStoryFiles.ts:175-181), causing traceName to bail
// at the story file (line 286) and source files (not story files) to end up
// in affectedModuleIds — which chromatic then can't match to storyIndex entries.
export function addStoryEntries(statsMap: Map<string, Module>, logger?: Logger): number {
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
  logger?.info({
    message: `parcel-reporter-turbosnap-stats: tagged ${tagged} story file(s) via synthetic CSF glob`
  });
  return tagged;
}

interface Logger {
  info: (m: {message: string}) => void;
}

export async function writeStats(
  distDir: string,
  statsMap: Map<string, Module>,
  outputFS: FileSystem,
  logger: Logger
): Promise<void> {
  // Sort modules by name so the emitted JSON is byte-stable across Parcel
  // versions even if bundle.traverseAssets order shifts. chromatic-cli doesn't
  // care about order; this only helps reproducibility for caching/diff use cases.
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
        'Check that parcel-resolver-storybook generated a stories.js virtual and STORY_VIRTUAL_RE matches its filePath.'
    );
  }

  await outputFS.writeFile(path.join(distDir, 'preview-stats.json'), JSON.stringify(stats), null);
  logger.info({
    message: `parcel-reporter-turbosnap-stats: wrote preview-stats.json (${stats.modules.length} modules) to ${distDir}`
  });
}
