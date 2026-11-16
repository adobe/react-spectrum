/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const corePromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'packages/dev/cli/s2/dist/agent-docs-core/src/index.js')).href
);
const publishModPromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'packages/dev/s2-docs/scripts/publishSnapshots.mjs')).href
);
const tarModPromise = import(
  pathToFileURL(path.join(REPO_ROOT, 'packages/dev/s2-docs/scripts/lib/tarArchive.mjs')).href
);

function buildMaliciousTarGz(entryName, typeFlagChar = '0') {
  const payload = Buffer.from('malicious', 'utf8');
  const header = Buffer.alloc(512, 0);
  header.write(entryName, 0, 100, 'utf8');
  header.write('0000644\0', 100, 8, 'ascii');
  header.write('0000000\0', 108, 8, 'ascii');
  header.write('0000000\0', 116, 8, 'ascii');
  header.write(
    (typeFlagChar === '0' ? payload.length : 0).toString(8).padStart(11, '0') + '\0',
    124,
    12,
    'ascii'
  );
  header.write('00000000000\0', 136, 12, 'ascii');
  header.fill(0x20, 148, 156);
  header.write(typeFlagChar, 156, 1, 'ascii');
  header.write('ustar\0', 257, 6, 'ascii');
  header.write('00', 263, 2, 'ascii');
  let sum = 0;
  for (let i = 0; i < 512; i++) {
    sum += header[i];
  }
  header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii');

  const blocks = [header];
  if (typeFlagChar === '0') {
    blocks.push(payload);
    const rem = payload.length % 512;
    if (rem !== 0) {
      blocks.push(Buffer.alloc(512 - rem, 0));
    }
  }
  blocks.push(Buffer.alloc(1024, 0));
  return zlib.gzipSync(Buffer.concat(blocks));
}

test('rejects path-traversal tar entries, symlink tar entries, SHA-256 tampering, future minReaderSchemaVersion, and offline misses', async () => {
  const {ensurePackageSliceExtracted, loadSnapshotIndex, unpackTarGzBufferToDir} =
    await corePromise;
  const {packTarGz} = await tarModPromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-sec-'));

  try {
    // 1. Zip-slip `../escape.txt` rejected
    const evilTraversalBuf = buildMaliciousTarGz('../escape.txt', '0');
    assert.throws(
      () => unpackTarGzBufferToDir(evilTraversalBuf, path.join(tmp, 'dest-1')),
      err => err.code === 'ERR_ARCHIVE_SECURITY'
    );
    assert.equal(fs.existsSync(path.join(tmp, 'escape.txt')), false);

    // 2. Symlink entry (`typeflag = '2'`) rejected
    const evilSymlinkBuf = buildMaliciousTarGz('docs/link', '2');
    assert.throws(
      () => unpackTarGzBufferToDir(evilSymlinkBuf, path.join(tmp, 'dest-2')),
      err => err.code === 'ERR_ARCHIVE_SECURITY'
    );

    // 3. Future `minReaderSchemaVersion: 99` index rejected with ERR_CATALOG_SCHEMA_TOO_NEW
    const futureSnapDir = path.join(tmp, 'future-snaps');
    fs.mkdirSync(futureSnapDir, {recursive: true});
    fs.writeFileSync(
      path.join(futureSnapDir, 'index.json'),
      JSON.stringify({
        schemaVersion: 99,
        minReaderSchemaVersion: 99,
        updatedAt: '',
        latest: {},
        packages: {},
        snapshots: {}
      })
    );
    await assert.rejects(
      () => loadSnapshotIndex({snapshotSource: futureSnapDir, cacheDir: path.join(tmp, 'c1')}),
      err => err.code === 'ERR_CATALOG_SCHEMA_TOO_NEW'
    );

    // 4. SHA-256 tamper rejection + concurrent slice caching + offline cache miss
    const snapRepo = path.join(tmp, 'snap-repo');
    const sliceRel = 'by-id/s1/packages/s2.tar.gz';
    const sliceAbs = path.join(snapRepo, sliceRel);
    fs.mkdirSync(path.dirname(sliceAbs), {recursive: true});
    const gzBytes = packTarGz([
      {
        path: 'slice-manifest.json',
        content: JSON.stringify({schemaVersion: 1, snapshotId: 's1'})
      }
    ]);
    fs.writeFileSync(sliceAbs, gzBytes);
    const validSha = crypto.createHash('sha256').update(gzBytes).digest('hex');

    const pointerBadHash = {
      snapshotId: 's1',
      packageVersion: '1.8.2',
      sliceRelPath: sliceRel,
      sliceSha256: 'f'.repeat(64),
      sliceBytes: gzBytes.length,
      entryCount: 1
    };
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted('@react-spectrum/s2', '1.8.2', pointerBadHash, {
          snapshotSource: snapRepo,
          cacheDir: path.join(tmp, 'c2')
        }),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );

    // Offline cache miss when unpopulated against remote source
    const pointerGood = {...pointerBadHash, sliceSha256: validSha};

    // Byte-length mismatch is rejected even when the slice itself is intact
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted(
          '@react-spectrum/s2',
          '1.8.2',
          {...pointerGood, sliceBytes: gzBytes.length - 1},
          {snapshotSource: snapRepo, cacheDir: path.join(tmp, 'c-bytes')}
        ),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted('@react-spectrum/s2', '1.8.2', pointerGood, {
          snapshotSource: 'https://react-spectrum.adobe.com/snapshots',
          cacheDir: path.join(tmp, 'c-offline'),
          offline: true
        }),
      err => err.code === 'ERR_OFFLINE_CACHE_MISS'
    );

    // Concurrent calls share extraction cleanly without racing
    const sharedCache = path.join(tmp, 'c-concurrent');
    const [dirA, dirB, dirC] = await Promise.all([
      ensurePackageSliceExtracted('@react-spectrum/s2', '1.8.2', pointerGood, {
        snapshotSource: snapRepo,
        cacheDir: sharedCache
      }),
      ensurePackageSliceExtracted('@react-spectrum/s2', '1.8.2', pointerGood, {
        snapshotSource: snapRepo,
        cacheDir: sharedCache
      }),
      ensurePackageSliceExtracted('@react-spectrum/s2', '1.8.2', pointerGood, {
        snapshotSource: snapRepo,
        cacheDir: sharedCache
      })
    ]);
    assert.equal(dirA, dirB);
    assert.equal(dirB, dirC);
    assert.equal(fs.existsSync(path.join(dirA, 'slice-manifest.json')), true);
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('publishSnapshots 3-step publisher retries CAS ETag races and preserves monotonic semver latest pointers', async () => {
  const {createLocalBucketStorage, publishStagedSnapshots} = await publishModPromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-pub-'));

  try {
    const stagedRoot = path.join(tmp, 'staged');
    const bucketRoot = path.join(tmp, 'bucket');

    const writeStagedSnap = (snapshotId, pkgVer) => {
      const relInSnap = 'packages/react-spectrum__s2.tar.gz';
      const sliceRel = `by-id/${snapshotId}/${relInSnap}`;
      const sliceAbs = path.join(stagedRoot, sliceRel);
      fs.mkdirSync(path.dirname(sliceAbs), {recursive: true});
      const sliceBuf = Buffer.from(`slice-${snapshotId}-${pkgVer}`, 'utf8');
      fs.writeFileSync(sliceAbs, sliceBuf);
      const sliceSha = crypto.createHash('sha256').update(sliceBuf).digest('hex');

      const manifestRel = `by-id/${snapshotId}/manifest.json`;
      const manifestAbs = path.join(stagedRoot, manifestRel);
      const manifestObj = {
        schemaVersion: 1,
        snapshotId,
        gitRef: `@react-spectrum/s2@${pkgVer}`,
        gitSha: 'abcdef123456',
        extractorVersion: '0.1.0',
        packages: {'@react-spectrum/s2': pkgVer},
        files: {
          [relInSnap]: {
            sha256: sliceSha,
            bytes: sliceBuf.length
          }
        },
        slices: {
          '@react-spectrum/s2': {
            packageVersion: pkgVer,
            sliceRelPath: sliceRel,
            sliceSha256: sliceSha,
            sliceBytes: sliceBuf.length,
            entryCount: 1,
            libraries: ['s2']
          }
        }
      };
      const manifestBuf = Buffer.from(JSON.stringify(manifestObj, null, 2), 'utf8');
      fs.writeFileSync(manifestAbs, manifestBuf);
      return {
        manifestSha: crypto.createHash('sha256').update(manifestBuf).digest('hex'),
        sliceSha,
        sliceBytes: sliceBuf.length,
        sliceRel,
        manifestRel
      };
    };

    const s182 = writeStagedSnap('snap-182', '1.8.2');
    const s120 = writeStagedSnap('snap-120', '1.2.0');
    fs.writeFileSync(
      path.join(stagedRoot, 'index.json'),
      JSON.stringify({
        schemaVersion: 1,
        updatedAt: '2026-04-20T00:00:00.000Z',
        latest: {'@react-spectrum/s2': '1.8.2'},
        packages: {
          '@react-spectrum/s2': {
            '1.8.2': {
              snapshotId: 'snap-182',
              packageVersion: '1.8.2',
              sliceRelPath: s182.sliceRel,
              sliceSha256: s182.sliceSha,
              sliceBytes: s182.sliceBytes,
              entryCount: 1
            },
            '1.2.0': {
              snapshotId: 'snap-120',
              packageVersion: '1.2.0',
              sliceRelPath: s120.sliceRel,
              sliceSha256: s120.sliceSha,
              sliceBytes: s120.sliceBytes,
              entryCount: 1,
              verifiedEquivalentPatches: ['1.2.2']
            }
          }
        },
        snapshots: {
          'snap-182': {
            snapshotId: 'snap-182',
            gitRef: '@react-spectrum/s2@1.8.2',
            gitSha: 'abcdef123456',
            extractorVersion: '0.1.0',
            manifestRelPath: s182.manifestRel,
            manifestSha256: s182.manifestSha,
            packages: {'@react-spectrum/s2': '1.8.2'}
          },
          'snap-120': {
            snapshotId: 'snap-120',
            gitRef: '@react-spectrum/s2@1.2.0',
            gitSha: 'abcdef123456',
            extractorVersion: '0.1.0',
            manifestRelPath: s120.manifestRel,
            manifestSha256: s120.manifestSha,
            packages: {'@react-spectrum/s2': '1.2.0'}
          }
        }
      })
    );

    const baseStorage = createLocalBucketStorage(bucketRoot);

    // Publish 1.8.2 first
    await publishStagedSnapshots({
      stagedDir: stagedRoot,
      storage: baseStorage,
      snapshotIds: ['snap-182']
    });

    // Now publish historical backfill 1.2.0 while simulating a concurrent CI writer racing on the first CAS attempt!
    const res = await publishStagedSnapshots({
      stagedDir: stagedRoot,
      storage: baseStorage,
      snapshotIds: ['snap-120'],
      async onBeforeCasPut({attempt, currentEtag}) {
        if (attempt === 1) {
          const curr = await baseStorage.getConditionalObject('index.json');
          const currJson = JSON.parse(curr.body);
          currJson.packages['react-aria-components'] = {
            '1.22.1': {
              snapshotId: 'snap-concurrent-rac',
              packageVersion: '1.22.1',
              sliceRelPath: 'by-id/snap-concurrent-rac/packages/rac.tar.gz',
              sliceSha256: 'e'.repeat(64),
              sliceBytes: 42,
              entryCount: 1
            }
          };
          await baseStorage.putConditionalObject(
            'index.json',
            JSON.stringify(currJson, null, 2) + '\n',
            {ifMatch: currentEtag}
          );
        }
      }
    });

    assert.equal(res.casAttempts, 2, 'Expected exactly 1 CAS retry after concurrent write');

    const finalIndex = JSON.parse(fs.readFileSync(path.join(bucketRoot, 'index.json'), 'utf8'));
    // Both concurrent RAC entry AND our 1.2.0 + 1.8.2 entries must exist!
    assert.ok(finalIndex.packages['react-aria-components']['1.22.1']);
    assert.ok(finalIndex.packages['@react-spectrum/s2']['1.8.2']);
    assert.deepEqual(finalIndex.packages['@react-spectrum/s2']['1.2.0'].verifiedEquivalentPatches, [
      '1.2.2'
    ]);
    // Publishing older backfill 1.2.0 MUST NOT downgrade `latest` from 1.8.2!
    assert.equal(finalIndex.latest['@react-spectrum/s2'], '1.8.2');

    // Re-publishing identical content is idempotent, but changed content under an
    // already-published immutable key is refused instead of overwritten.
    await publishStagedSnapshots({
      stagedDir: stagedRoot,
      storage: baseStorage,
      snapshotIds: ['snap-182']
    });
    const publishedSlice = fs.readFileSync(path.join(bucketRoot, s182.sliceRel));
    const stagedIndex = JSON.parse(fs.readFileSync(path.join(stagedRoot, 'index.json'), 'utf8'));
    const tampered = writeStagedSnap('snap-182', '1.8.3');
    stagedIndex.packages['@react-spectrum/s2']['1.8.2'].sliceSha256 = tampered.sliceSha;
    stagedIndex.packages['@react-spectrum/s2']['1.8.2'].sliceBytes = tampered.sliceBytes;
    stagedIndex.snapshots['snap-182'].manifestSha256 = tampered.manifestSha;
    fs.writeFileSync(path.join(stagedRoot, 'index.json'), JSON.stringify(stagedIndex));
    await assert.rejects(
      () =>
        publishStagedSnapshots({
          stagedDir: stagedRoot,
          storage: baseStorage,
          snapshotIds: ['snap-182']
        }),
      /Refusing to overwrite immutable object/
    );
    assert.deepEqual(fs.readFileSync(path.join(bucketRoot, s182.sliceRel)), publishedSlice);
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});
