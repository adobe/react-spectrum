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
      additionalReporters: [
        {
          packageName: '@parcel/reporter-turbosnap-stats',
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

    // The fixture has no storybook-resolver stories.js virtual, but it does include
    // Button.stories.tsx. addStoryEntries bridges the gap by injecting
    // './storybook-stories.js' as a reason on every .stories.* asset, so the
    // reporter succeeds and writes preview-stats.json. Verify the file exists and
    // contains the CSF-glob reason — that proves the entire chain ran against real
    // Parcel internals.
    await parcel.run();
    const statsPath = path.join(distDir, 'preview-stats.json');
    expect(fs.existsSync(statsPath)).toBe(true);
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    const storiesModule = stats.modules.find((m: any) =>
      m.reasons.some((r: any) => r.moduleName === './storybook-stories.js')
    );
    expect(storiesModule).toBeDefined();
    expect(storiesModule.name).toMatch(/\.stories\./);
    expect(stats.modules.length).toBeGreaterThan(0);
  });
});
