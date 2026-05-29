import {addStoryEntries, buildStatsMap, rewriteStoryVirtuals, writeStats} from './helpers';
import {Reporter} from '@parcel/plugin';

const reporter = new Reporter({
  async report({event, options, logger}) {
    if (event.type !== 'buildSuccess') return;

    const statsMap = buildStatsMap(event.bundleGraph, options.projectRoot);
    rewriteStoryVirtuals(statsMap);
    addStoryEntries(statsMap, logger);

    const bundles = event.bundleGraph.getBundles();
    const distDir = bundles[0]?.target.distDir;
    if (!distDir) {
      throw new Error(
        'parcel-reporter-turbosnap-stats: no bundles were produced; cannot determine output dir.'
      );
    }
    await writeStats(distDir, statsMap, options.outputFS, logger);
  }
});

// Parcel's plugin loader expects `module.exports = <pluginInstance>`,
// not the `.default` wrapper TypeScript would otherwise produce.
module.exports = reporter;
