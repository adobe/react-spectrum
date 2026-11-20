import {addStoryEntries, buildStatsMap, createStats, rewriteStoryVirtuals} from './helpers';
import type {Asset, BundleGraph} from './helpers';
import {Reporter} from '@parcel/plugin';

// Must match STATS_MARKER in storybook-builder-parcel/preset.mjs.
const STATS_MARKER = 'TURBOSNAP_STATS_JSON:';

interface BuildSuccessEvent {
  bundleGraph: BundleGraph;
  changedAssets: Asset[];
  options: {projectRoot: string};
}

// Parcel 3 runs plugins in a sandbox that can't write files, so the stats are
// printed to stdout as one line prefixed with STATS_MARKER. storybook-builder-parcel
// extracts that line and returns the stats from build(), and Storybook writes
// them to preview-stats.json.
//
// @parcel/plugin's typings describe the Parcel 2 reporter API (`report`), but
// Parcel 3 also accepts its Reporter class and calls `buildSuccess` instead.
export default new Reporter({
  buildSuccess({bundleGraph, changedAssets, options}: BuildSuccessEvent) {
    const {statsMap, retargetedImports} = buildStatsMap(
      bundleGraph,
      changedAssets,
      options.projectRoot
    );
    rewriteStoryVirtuals(statsMap);
    const tagged = addStoryEntries(statsMap);
    const stats = createStats(statsMap);
    console.log(
      `parcel-reporter-turbosnap-stats: ${stats.modules.length} modules, tagged ${tagged} story file(s) via synthetic CSF glob, retargeted ${retargetedImports} import(s) past barrel files`
    );
    console.log(STATS_MARKER + JSON.stringify(stats));
  }
} as any);
