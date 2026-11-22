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
import http from 'node:http';
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

    // Local snapshot manifests bypass the disk cache so in-place local rebuilds are immediately visible
    const {loadSnapshotManifest} = await corePromise;
    const localManifestDir = path.join(tmp, 'local-manifest-snap');
    const localManifestRel = 'by-id/local-1/manifest.json';
    const localManifestAbs = path.join(localManifestDir, localManifestRel);
    fs.mkdirSync(path.dirname(localManifestAbs), {recursive: true});
    const manifestV1 = {
      schemaVersion: 1,
      snapshotId: 'local-1',
      packages: {'@react-spectrum/s2': '1.0.0'},
      files: {},
      slices: {}
    };
    fs.writeFileSync(localManifestAbs, JSON.stringify(manifestV1));
    const localCache = path.join(tmp, 'c-local-manifest');
    const firstRead = await loadSnapshotManifest(
      {snapshotId: 'local-1', manifestPath: localManifestRel},
      {snapshotSource: localManifestDir, cacheDir: localCache}
    );
    assert.equal(firstRead.packages['@react-spectrum/s2'], '1.0.0');
    const manifestV2 = {...manifestV1, packages: {'@react-spectrum/s2': '1.0.1'}};
    fs.writeFileSync(localManifestAbs, JSON.stringify(manifestV2));
    const secondRead = await loadSnapshotManifest(
      {snapshotId: 'local-1', manifestPath: localManifestRel},
      {snapshotSource: localManifestDir, cacheDir: localCache}
    );
    assert.equal(secondRead.packages['@react-spectrum/s2'], '1.0.1');
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

    // Concurrent immutable upload race (PreconditionFailed with matching remote bytes/SHA-256) succeeds idempotently,
    // while Step 2 verification rejects objects missing remote sha256 metadata.
    const s190 = writeStagedSnap('snap-190', '1.9.0');
    const freshIdx = JSON.parse(fs.readFileSync(path.join(stagedRoot, 'index.json'), 'utf8'));
    freshIdx.packages['@react-spectrum/s2']['1.9.0'] = {
      snapshotId: 'snap-190',
      packageVersion: '1.9.0',
      sliceRelPath: s190.sliceRel,
      sliceSha256: s190.sliceSha,
      sliceBytes: s190.sliceBytes,
      entryCount: 1
    };
    freshIdx.snapshots['snap-190'] = {
      snapshotId: 'snap-190',
      gitRef: '@react-spectrum/s2@1.9.0',
      gitSha: 'abcdef123456',
      extractorVersion: '0.1.0',
      manifestRelPath: s190.manifestRel,
      manifestSha256: s190.manifestSha,
      packages: {'@react-spectrum/s2': '1.9.0'}
    };
    fs.writeFileSync(path.join(stagedRoot, 'index.json'), JSON.stringify(freshIdx));
    let simulatedRace = false;
    const racingStorage = {
      ...baseStorage,
      async putImmutableObject(relKey, bodyBuf, meta) {
        if (!simulatedRace && relKey === s190.sliceRel) {
          simulatedRace = true;
          await baseStorage.putImmutableObject(relKey, bodyBuf, meta);
          const conflict = new Error('Simulated concurrent immutable upload');
          conflict.code = 'PreconditionFailed';
          throw conflict;
        }
        return baseStorage.putImmutableObject(relKey, bodyBuf, meta);
      }
    };
    await publishStagedSnapshots({
      stagedDir: stagedRoot,
      storage: racingStorage,
      snapshotIds: ['snap-190']
    });
    assert.equal(simulatedRace, true);

    const missingShaStorage = {
      ...baseStorage,
      async headObject(relKey) {
        const head = await baseStorage.headObject(relKey);
        return head ? {...head, sha256: null} : null;
      }
    };
    await assert.rejects(
      () =>
        publishStagedSnapshots({
          stagedDir: stagedRoot,
          storage: missingShaStorage,
          snapshotIds: ['snap-190']
        }),
      /Post-upload SHA-256 mismatch|Refusing to overwrite immutable object/
    );
  } finally {
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('parses multi-byte UTF-8 PAX tar paths, allows additive entry schemaVersion, and never falls back to stale cache on future index schema', async () => {
  const {loadSnapshotIndex, readSliceEntryBySlug, unpackTarGzBufferToDir} = await corePromise;
  const {packTarGz} = await tarModPromise;
  const {createServer} = await import('node:http');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-pax-schema-'));
  let server;
  try {
    // 1. Multi-byte UTF-8 PAX path (>100 bytes forces PAX header)
    const longUtf8Path = `entries/s2/${'café-über-日本語-'.repeat(8)}doc.json`;
    const gz = packTarGz([{path: longUtf8Path, content: '{"ok":true}'}]);
    const dest = path.join(tmp, 'unpacked');
    unpackTarGzBufferToDir(gz, dest);
    assert.equal(fs.readFileSync(path.join(dest, longUtf8Path), 'utf8'), '{"ok":true}');

    // 2. Additive schemaVersion bump with minReaderSchemaVersion: 1 succeeds in readSliceEntryBySlug
    const sliceDir = path.join(tmp, 'slice');
    const entryPath = path.join(sliceDir, 'entries/s2/Button.json');
    fs.mkdirSync(path.dirname(entryPath), {recursive: true});
    fs.writeFileSync(
      entryPath,
      JSON.stringify({
        schemaVersion: 2,
        minReaderSchemaVersion: 1,
        id: 's2:Button',
        slug: 'Button',
        library: 's2',
        packageName: '@react-spectrum/s2',
        packageVersion: '1.0.0',
        kind: 'component',
        title: 'Button',
        summary: 'Button',
        keywords: [],
        sourceUrl: '',
        imports: [],
        compositionRules: [],
        exports: [],
        sections: []
      })
    );
    const loadedEntry = readSliceEntryBySlug(sliceDir, 's2', 'Button');
    assert.equal(loadedEntry?.entry.id, 's2:Button');

    // 3. Stale cached index MUST NOT mask ERR_CATALOG_SCHEMA_TOO_NEW on refresh
    let minReader = 1;
    server = createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(
        JSON.stringify({
          schemaVersion: minReader,
          minReaderSchemaVersion: minReader,
          updatedAt: new Date().toISOString(),
          latest: {},
          packages: {},
          snapshots: {}
        })
      );
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const {port} = server.address();
    const sourceUrl = `http://127.0.0.1:${port}`;
    const cacheDir = path.join(tmp, 'cache');
    await loadSnapshotIndex({snapshotSource: sourceUrl, cacheDir});
    minReader = 99;
    await assert.rejects(
      () => loadSnapshotIndex({snapshotSource: sourceUrl, cacheDir, forceRefreshIndex: true}),
      err => err.code === 'ERR_CATALOG_SCHEMA_TOO_NEW'
    );
  } finally {
    if (server?.listening) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('enforces cache size caps, rejects cache/source path traversal, recovers from corrupt cached index, and keeps lock waits non-blocking', async () => {
  const {ensurePackageSliceExtracted, loadSnapshotIndex, loadSnapshotManifest} = await corePromise;
  const {packTarGz} = await tarModPromise;
  const {createServer} = await import('node:http');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-test-cache-hardening-'));
  let server;
  try {
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

    // 1. Oversized declared manifestBytes / sliceBytes are rejected instead of bypassing hard caps
    await assert.rejects(
      () =>
        loadSnapshotManifest(
          {
            snapshotId: 's1',
            manifestPath: 'by-id/s1/manifest.json',
            manifestBytes: 512 * 1024 * 1024
          },
          {snapshotSource: snapRepo, cacheDir: path.join(tmp, 'c-cap-manifest')}
        ),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted(
          '@react-spectrum/s2',
          '1.8.2',
          {
            snapshotId: 's1',
            packageVersion: '1.8.2',
            sliceRelPath: sliceRel,
            sliceSha256: validSha,
            sliceBytes: 512 * 1024 * 1024,
            entryCount: 1
          },
          {snapshotSource: snapRepo, cacheDir: path.join(tmp, 'c-cap-slice')}
        ),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );

    // 2. Path traversal in version, sliceSha256, or local sliceRelPath is rejected
    const basePointer = {
      snapshotId: 's1',
      packageVersion: '1.8.2',
      sliceRelPath: sliceRel,
      sliceSha256: validSha,
      sliceBytes: gzBytes.length,
      entryCount: 1
    };
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted('@react-spectrum/s2', '../../escape', basePointer, {
          snapshotSource: snapRepo,
          cacheDir: path.join(tmp, 'c-trav-ver')
        }),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted(
          '@react-spectrum/s2',
          '1.8.2',
          {...basePointer, sliceSha256: '../../badsha'},
          {snapshotSource: snapRepo, cacheDir: path.join(tmp, 'c-trav-sha')}
        ),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );
    await assert.rejects(
      () =>
        ensurePackageSliceExtracted(
          '@react-spectrum/s2',
          '1.8.2',
          {...basePointer, sliceRelPath: '../outside.tar.gz'},
          {snapshotSource: snapRepo, cacheDir: path.join(tmp, 'c-trav-rel')}
        ),
      err => err.code === 'ERR_CACHE_INTEGRITY'
    );

    // 3. Corrupted cached index.json on disk is discarded and refetched instead of throwing SyntaxError
    server = createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(
        JSON.stringify({
          schemaVersion: 1,
          minReaderSchemaVersion: 1,
          updatedAt: '2026-04-20T00:00:00.000Z',
          latest: {},
          packages: {},
          snapshots: {}
        })
      );
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const {port} = server.address();
    const sourceUrl = `http://127.0.0.1:${port}`;
    const corruptCacheDir = path.join(tmp, 'c-corrupt-index');
    fs.mkdirSync(corruptCacheDir, {recursive: true});
    const sourceHash = crypto.createHash('sha256').update(sourceUrl).digest('hex').slice(0, 12);
    fs.writeFileSync(path.join(corruptCacheDir, `index-${sourceHash}.json`), '{truncated json');
    const recovered = await loadSnapshotIndex({
      snapshotSource: sourceUrl,
      cacheDir: corruptCacheDir
    });
    assert.equal(recovered.schemaVersion, 1);

    // 4. Waiting on an extraction lock does not block the Node.js event loop
    const lockCacheDir = path.join(tmp, 'c-async-lock');
    const slicesRoot = path.join(lockCacheDir, 'slices');
    fs.mkdirSync(slicesRoot, {recursive: true});
    const lockPath = path.join(
      slicesRoot,
      `react-spectrum__s2@1.8.2-${validSha.slice(0, 12)}.lock`
    );
    fs.writeFileSync(lockPath, 'held');
    let timerTicks = 0;
    const interval = setInterval(() => {
      timerTicks++;
    }, 10);
    setTimeout(() => {
      fs.rmSync(lockPath, {force: true});
    }, 80);
    try {
      const extractedDir = await ensurePackageSliceExtracted(
        '@react-spectrum/s2',
        '1.8.2',
        basePointer,
        {snapshotSource: snapRepo, cacheDir: lockCacheDir}
      );
      assert.equal(fs.existsSync(path.join(extractedDir, '.ready.json')), true);
      assert.ok(
        timerTicks > 0,
        `Expected event loop timers to tick during lock wait, got ${timerTicks}`
      );
    } finally {
      clearInterval(interval);
    }
  } finally {
    if (server?.listening) {
      server.closeAllConnections();
      await new Promise(resolve => server.close(resolve));
    }
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});

test('mergeSnapshotIndices preserves existing pointers at same docRevision without mutating input, and S3 headObject rethrows non-404 errors', async () => {
  const {createAwsS3Storage, mergeSnapshotIndices} = await publishModPromise;

  // 1. Existing version pointer is NOT overwritten by a different snapshot at docRevision 1,
  //    and remoteIndex is not mutated in place.
  const remoteIndex = {
    schemaVersion: 1,
    minReaderSchemaVersion: 1,
    updatedAt: '2026-04-20T00:00:00.000Z',
    latest: {'@react-spectrum/s2': '1.8.2'},
    snapshots: {
      'snap-release-182': {
        snapshotId: 'snap-release-182',
        packages: {'@react-spectrum/s2': '1.8.2'}
      }
    },
    packages: {
      '@react-spectrum/s2': {
        '1.8.2': {
          snapshotId: 'snap-release-182',
          docRevision: 1,
          packageVersion: '1.8.2',
          sliceRelPath: 'by-id/snap-release-182/packages/s2.tar.gz',
          sliceSha256: 'a'.repeat(64),
          sliceBytes: 100,
          entryCount: 1,
          verifiedEquivalentPatches: ['1.8.3']
        }
      }
    }
  };
  const stagedSameRev = {
    schemaVersion: 1,
    minReaderSchemaVersion: 1,
    updatedAt: '2026-04-21T00:00:00.000Z',
    latest: {'@react-spectrum/s2': '1.8.2'},
    snapshots: {
      'snap-unreleased-main': {
        snapshotId: 'snap-unreleased-main',
        packages: {'@react-spectrum/s2': '1.8.2'}
      }
    },
    packages: {
      '@react-spectrum/s2': {
        '1.8.2': {
          snapshotId: 'snap-unreleased-main',
          docRevision: 1,
          packageVersion: '1.8.2',
          sliceRelPath: 'by-id/snap-unreleased-main/packages/s2.tar.gz',
          sliceSha256: 'b'.repeat(64),
          sliceBytes: 120,
          entryCount: 2,
          verifiedEquivalentPatches: ['1.8.4']
        }
      }
    }
  };

  const mergedSameRev = mergeSnapshotIndices(remoteIndex, stagedSameRev);
  assert.equal(
    mergedSameRev.packages['@react-spectrum/s2']['1.8.2'].snapshotId,
    'snap-release-182'
  );
  assert.deepEqual(
    mergedSameRev.packages['@react-spectrum/s2']['1.8.2'].verifiedEquivalentPatches,
    ['1.8.3', '1.8.4']
  );
  // Original remoteIndex must remain unmutated
  assert.deepEqual(remoteIndex.packages['@react-spectrum/s2']['1.8.2'].verifiedEquivalentPatches, [
    '1.8.3'
  ]);

  // 2. Strictly higher docRevision DOES replace the pointer while preserving verifiedEquivalentPatches
  const stagedHigherRev = {
    ...stagedSameRev,
    packages: {
      '@react-spectrum/s2': {
        '1.8.2': {
          ...stagedSameRev.packages['@react-spectrum/s2']['1.8.2'],
          snapshotId: 'snap-docfix-182-d2',
          docRevision: 2
        }
      }
    }
  };
  const mergedHigherRev = mergeSnapshotIndices(remoteIndex, stagedHigherRev);
  assert.equal(
    mergedHigherRev.packages['@react-spectrum/s2']['1.8.2'].snapshotId,
    'snap-docfix-182-d2'
  );
  assert.deepEqual(
    mergedHigherRev.packages['@react-spectrum/s2']['1.8.2'].verifiedEquivalentPatches,
    ['1.8.3', '1.8.4']
  );

  // 3. S3 headObject returns null only on 404/NotFound/NoSuchKey and rethrows AccessDenied/network errors
  const s3NotFound = createAwsS3Storage('test-bucket', 'snapshots', {
    async execAws() {
      const err = new Error('Command failed');
      err.stderr = 'An error occurred (404) when calling the HeadObject operation: Not Found';
      throw err;
    }
  });
  assert.equal(await s3NotFound.headObject('by-id/s1/manifest.json'), null);

  const s3AccessDenied = createAwsS3Storage('test-bucket', 'snapshots', {
    async execAws() {
      const err = new Error('Command failed');
      err.stderr = 'An error occurred (403) when calling the HeadObject operation: Forbidden';
      throw err;
    }
  });
  await assert.rejects(() => s3AccessDenied.headObject('by-id/s1/manifest.json'), /Command failed/);

  // 4. Prerelease latest comparison uses SemVer numeric precedence and never downgrades
  const prePointer = (ver, snapId) => ({
    snapshotId: snapId,
    docRevision: 1,
    packageVersion: ver,
    sliceRelPath: `by-id/${snapId}/packages/s2.tar.gz`,
    sliceSha256: 'c'.repeat(64),
    sliceBytes: 100,
    entryCount: 1
  });
  const preRemote = {
    schemaVersion: 1,
    minReaderSchemaVersion: 1,
    updatedAt: '2026-04-20T00:00:00.000Z',
    latest: {'@react-spectrum/s2': '2.0.0-beta.10'},
    snapshots: {},
    packages: {'@react-spectrum/s2': {'2.0.0-beta.10': prePointer('2.0.0-beta.10', 'snap-b10')}}
  };
  const preOlderStaged = {
    schemaVersion: 1,
    minReaderSchemaVersion: 1,
    updatedAt: '2026-04-21T00:00:00.000Z',
    latest: {'@react-spectrum/s2': '2.0.0-beta.2'},
    snapshots: {},
    packages: {'@react-spectrum/s2': {'2.0.0-beta.2': prePointer('2.0.0-beta.2', 'snap-b2')}}
  };
  assert.equal(
    mergeSnapshotIndices(preRemote, preOlderStaged).latest['@react-spectrum/s2'],
    '2.0.0-beta.10'
  );
  const preNewerStaged = {
    ...preOlderStaged,
    latest: {'@react-spectrum/s2': '2.0.0-rc.1'},
    packages: {'@react-spectrum/s2': {'2.0.0-rc.1': prePointer('2.0.0-rc.1', 'snap-rc1')}}
  };
  assert.equal(
    mergeSnapshotIndices(preRemote, preNewerStaged).latest['@react-spectrum/s2'],
    '2.0.0-rc.1'
  );
});

test('loadSnapshotIndex sends If-None-Match ETag on refresh and handles 304 Not Modified by resetting TTL', async () => {
  const {loadSnapshotIndex} = await corePromise;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-etag-cache-'));
  const seenHeaders = [];
  const indexPayload = {
    schemaVersion: 1,
    minReaderSchemaVersion: 1,
    updatedAt: '2026-04-20T00:00:00.000Z',
    latest: {'@react-spectrum/s2': '1.9.0'},
    snapshots: {},
    packages: {}
  };
  let etag = '"idx-etag-v1"';
  const server = http.createServer((req, res) => {
    seenHeaders.push(req.headers['if-none-match'] || null);
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, {ETag: etag});
      res.end();
      return;
    }
    res.writeHead(200, {'Content-Type': 'application/json', ETag: etag});
    res.end(JSON.stringify(indexPayload));
  });

  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const sourceUrl = `http://127.0.0.1:${port}`;

    // 1. Initial fetch returns 200 and caches both index + ETag
    const first = await loadSnapshotIndex({cacheDir: tmp, snapshotSource: sourceUrl});
    assert.equal(first.latest['@react-spectrum/s2'], '1.9.0');
    assert.deepEqual(seenHeaders, [null]);

    // 2. Expire cached index mtime -> conditional fetch sends If-None-Match and receives 304
    const indexFile = fs
      .readdirSync(tmp)
      .find(
        name => name.startsWith('index-') && name.endsWith('.json') && !name.endsWith('.meta.json')
      );
    assert.ok(indexFile);
    const indexPath = path.join(tmp, indexFile);
    const expired = new Date(Date.now() - 20 * 60 * 1000);
    fs.utimesSync(indexPath, expired, expired);

    const second = await loadSnapshotIndex({cacheDir: tmp, snapshotSource: sourceUrl});
    assert.equal(second.latest['@react-spectrum/s2'], '1.9.0');
    assert.deepEqual(seenHeaders, [null, '"idx-etag-v1"']);

    // 3. 304 refreshed the cached file mtime -> next call hits TTL cache without an HTTP request
    const third = await loadSnapshotIndex({cacheDir: tmp, snapshotSource: sourceUrl});
    assert.equal(third.latest['@react-spectrum/s2'], '1.9.0');
    assert.equal(seenHeaders.length, 2);

    // 4. When server ETag changes and forceRefreshIndex is set -> 200 updates cache & ETag
    etag = '"idx-etag-v2"';
    indexPayload.latest['@react-spectrum/s2'] = '1.9.1';
    const fourth = await loadSnapshotIndex({
      cacheDir: tmp,
      snapshotSource: sourceUrl,
      forceRefreshIndex: true
    });
    assert.equal(fourth.latest['@react-spectrum/s2'], '1.9.1');
    assert.deepEqual(seenHeaders, [null, '"idx-etag-v1"', '"idx-etag-v1"']);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(tmp, {recursive: true, force: true});
  }
});
