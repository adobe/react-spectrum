import fs from 'fs';
import {FSCache} from '@parcel/cache';
// @ts-ignore — @parcel/fs has no published types in this version
import {NodeFS} from '@parcel/fs';
import os from 'os';
import {Parcel} from '@parcel/core';
import path from 'path';

jest.setTimeout(60_000);

describe('integration: real Parcel build emits preview-stats.json', () => {
  test('reporter runs end-to-end and writes valid preview-stats.json', async () => {
    const fixtureDir = path.join(__dirname, '__fixtures__');
    const distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-int-'));
    // Use FSCache so Jest's CJS transform doesn't trip over lmdb/native.js
    // which uses import.meta.url (ESM-only) causing "URL must be of scheme file".
    const cacheDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-cache-'));
    // @ts-expect-error — published @parcel/cache .d.ts declares FSCache(cacheDir) but the runtime constructor is FSCache(fs, cacheDir)
    const cache = new FSCache(new NodeFS(), cacheDir);

    const parcel = new (Parcel as any)({
      entries: path.join(fixtureDir, 'index.html'),
      config: path.join(fixtureDir, '.parcelrc'),
      mode: 'production',
      cache,
      // Disable Parcel's persistent cache so it never reads/writes @parcel/watcher
      // snapshot files. The BruteForceBackend used on Linux CI containers throws
      // "Unable to open snapshot file" on a fresh cache; with shouldDisableCache
      // Parcel skips the snapshot read entirely.
      shouldDisableCache: true,
      additionalReporters: [
        {
          // Point Parcel's plugin resolver at the package's local entry rather
          // than '@parcel/reporter-turbosnap-stats'. yarn doesn't symlink this
          // workspace into node_modules/@parcel/ until a dependent package
          // (storybook-builder-parcel) is also installed, so a fresh checkout
          // would fail with "Cannot find Parcel plugin". A relative path is
          // permitted by Parcel's plugin-name validator (ParcelConfig.schema.js:29).
          packageName: '../index.js',
          resolveFrom: __filename
        }
      ],
      targets: {
        default: {
          distDir,
          publicUrl: './'
        }
      }
    });

    // The fixture mirrors the production setup: preview.js imports a stories.js
    // entry at storybook-builder-parcel/generated-entries/stories.js, which
    // async-imports Button.stories.tsx. After buildStatsMap (with
    // resolveAsyncDependency unwrapping the runtime wrapper), rewriteStoryVirtuals
    // renames the entry to ./storybook-stories.js, and addStoryEntries rewrites
    // the story file's reason to point at the synthetic ./parcel-csf-glob.js.
    // Verify the three-level chain chromatic-cli's traversal expects:
    //   1. The CSF-glob node exists and has ./storybook-stories.js as a reason
    //   2. At least one .stories.* file has the CSF-glob node as a reason
    await parcel.run();
    const statsPath = path.join(distDir, 'preview-stats.json');
    expect(fs.existsSync(statsPath)).toBe(true);
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));

    const csfGlobNode = stats.modules.find((m: any) => m.name === './parcel-csf-glob.js');
    expect(csfGlobNode).toBeDefined();
    expect(csfGlobNode.reasons).toEqual([{moduleName: './storybook-stories.js'}]);

    const storyFile = stats.modules.find(
      (m: any) =>
        /\.stories\./.test(m.name) &&
        m.reasons.some((r: any) => r.moduleName === './parcel-csf-glob.js')
    );
    expect(storyFile).toBeDefined();
    expect(stats.modules.length).toBeGreaterThan(0);
  });
});
