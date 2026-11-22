#!/usr/bin/env node
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

/**
 * Hardened 3-step publisher for immutable versioned documentation snapshots:
 *
 * 1. Upload immutable `snapshots/by-id/<snapshotId>/**` objects (`max-age=31536000,immutable`).
 * 2. Verify object completeness & SHA-256 metadata/bytes before touching `snapshots/index.json`.
 * 3. Merge-update `snapshots/index.json` using optimistic concurrency (`If-Match: <ETag>` /
 *    `If-None-Match: "*"`) with retry backoff so concurrent CI release and backfill jobs never
 *    overwrite each other's additions.
 */

import crypto from 'node:crypto';
import {execFile} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import {parseArgs, promisify} from 'node:util';
import path from 'node:path';

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

export const IMMUTABLE_CACHE_CONTROL = 'public,max-age=31536000,immutable';
export const INDEX_CACHE_CONTROL = 'public,max-age=60,stale-while-revalidate=300';

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function contentTypeForPath(relPath) {
  if (relPath.endsWith('.tar.gz') || relPath.endsWith('.tgz')) {
    return 'application/gzip';
  }
  if (relPath.endsWith('.json')) {
    return 'application/json;charset=utf-8';
  }
  if (relPath.endsWith('.md')) {
    return 'text/markdown;charset=utf-8';
  }
  return 'application/octet-stream';
}

function parseSemver(v) {
  let m = String(v).match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!m) {
    return null;
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] || null
  };
}

function comparePrerelease(aPre, bPre) {
  let aParts = aPre.split('.');
  let bParts = bPre.split('.');
  let len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    if (i >= aParts.length) {
      return -1;
    }
    if (i >= bParts.length) {
      return 1;
    }
    let aNum = /^\d+$/.test(aParts[i]);
    let bNum = /^\d+$/.test(bParts[i]);
    if (aNum && bNum) {
      let diff = Number(aParts[i]) - Number(bParts[i]);
      if (diff !== 0) {
        return diff;
      }
    } else if (aNum !== bNum) {
      return aNum ? -1 : 1;
    } else if (aParts[i] !== bParts[i]) {
      return aParts[i] < bParts[i] ? -1 : 1;
    }
  }
  return 0;
}

function isNewerStableSemver(candidate, current) {
  if (!current) {
    return true;
  }
  let a = parseSemver(candidate);
  let b = parseSemver(current);
  if (!a || !b) {
    return candidate > current;
  }
  if (a.prerelease && !b.prerelease) {
    return false;
  }
  if (!a.prerelease && b.prerelease) {
    return true;
  }
  if (a.major !== b.major) {
    return a.major > b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor > b.minor;
  }
  if (a.patch !== b.patch) {
    return a.patch > b.patch;
  }
  if (a.prerelease && b.prerelease) {
    return comparePrerelease(a.prerelease, b.prerelease) >= 0;
  }
  return true;
}

/**
 * Pure deterministic index merge used during CAS loop: merges `stagedIndex` additions
 * into `remoteIndex` without dropping any snapshots or verified patches added by peers.
 */
export function mergeSnapshotIndices(remoteIndex, stagedIndex) {
  let base = remoteIndex || {
    schemaVersion: stagedIndex.schemaVersion || 1,
    minReaderSchemaVersion: stagedIndex.minReaderSchemaVersion || 1,
    updatedAt: new Date().toISOString(),
    latest: {},
    snapshots: {},
    packages: {}
  };

  let mergedSnapshots = {...(base.snapshots || {})};
  for (let [snapId, snapInfo] of Object.entries(stagedIndex.snapshots || {})) {
    if (!(snapId in mergedSnapshots)) {
      mergedSnapshots[snapId] = snapInfo;
    }
  }

  let mergedPackages = {...(base.packages || {})};
  for (let [pkgName, verMap] of Object.entries(stagedIndex.packages || {})) {
    mergedPackages[pkgName] = {...(mergedPackages[pkgName] || {})};
    for (let [ver, sliceInfo] of Object.entries(verMap || {})) {
      let existing = mergedPackages[pkgName][ver];
      let stagedDocRevision = sliceInfo.docRevision || 1;
      let existingDocRevision = existing?.docRevision || 1;
      let unionPatches = Array.from(
        new Set([
          ...(existing?.verifiedEquivalentPatches || []),
          ...(sliceInfo.verifiedEquivalentPatches || [])
        ])
      ).sort();
      if (!existing || stagedDocRevision > existingDocRevision) {
        mergedPackages[pkgName][ver] = {
          ...sliceInfo,
          verifiedEquivalentPatches: unionPatches
        };
      } else {
        mergedPackages[pkgName][ver] = {
          ...existing,
          verifiedEquivalentPatches: unionPatches
        };
      }
    }
  }

  let mergedLatest = {...(base.latest || {})};
  for (let [pkgName, verMap] of Object.entries(mergedPackages)) {
    for (let ver of Object.keys(verMap)) {
      if (isNewerStableSemver(ver, mergedLatest[pkgName])) {
        mergedLatest[pkgName] = ver;
      }
    }
  }

  let previousChannelSnapshotIds = new Set();
  let mergedChannels = {};
  for (let [channelName, pkgMap] of Object.entries(base.channels || {})) {
    mergedChannels[channelName] = {...(pkgMap || {})};
    for (let ptr of Object.values(pkgMap || {})) {
      if (ptr?.snapshotId) {
        previousChannelSnapshotIds.add(ptr.snapshotId);
      }
    }
  }
  for (let [channelName, pkgMap] of Object.entries(stagedIndex.channels || {})) {
    mergedChannels[channelName] = {
      ...(mergedChannels[channelName] || {}),
      ...(pkgMap || {})
    };
  }

  // Prune channel snapshot entries that were superseded and are no longer referenced anywhere.
  if (previousChannelSnapshotIds.size > 0) {
    let referencedSnapshotIds = new Set(Object.keys(stagedIndex.snapshots || {}));
    for (let verMap of Object.values(mergedPackages)) {
      for (let ptr of Object.values(verMap || {})) {
        if (ptr?.snapshotId) {
          referencedSnapshotIds.add(ptr.snapshotId);
        }
      }
    }
    for (let pkgMap of Object.values(mergedChannels)) {
      for (let ptr of Object.values(pkgMap || {})) {
        if (ptr?.snapshotId) {
          referencedSnapshotIds.add(ptr.snapshotId);
        }
      }
    }
    for (let oldSnapId of previousChannelSnapshotIds) {
      if (!referencedSnapshotIds.has(oldSnapId)) {
        delete mergedSnapshots[oldSnapId];
      }
    }
  }

  return {
    schemaVersion: Math.max(base.schemaVersion || 1, stagedIndex.schemaVersion || 1),
    minReaderSchemaVersion: Math.max(
      base.minReaderSchemaVersion || 1,
      stagedIndex.minReaderSchemaVersion || 1
    ),
    updatedAt: new Date().toISOString(),
    latest: mergedLatest,
    ...(Object.keys(mergedChannels).length > 0 ? {channels: mergedChannels} : {}),
    snapshots: mergedSnapshots,
    packages: mergedPackages
  };
}

/**
 * Storage adapter backed by a local filesystem directory (for offline verification & CAS tests).
 */
export function createLocalBucketStorage(bucketRootDir) {
  fs.mkdirSync(bucketRootDir, {recursive: true});

  const objPath = key => path.join(bucketRootDir, ...key.split('/'));
  const metaPath = key => `${objPath(key)}.__s3meta__.json`;

  return {
    async putImmutableObject(key, bodyBuf, {sha256, contentType, cacheControl}) {
      let target = objPath(key);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      let tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
      fs.writeFileSync(tmp, bodyBuf);
      try {
        // linkSync fails with EEXIST instead of replacing, matching S3 `If-None-Match: *`.
        fs.linkSync(tmp, target);
      } catch (err) {
        if (err.code === 'EEXIST') {
          const conflict = new Error(`Immutable object already exists: ${key}`);
          conflict.code = 'PreconditionFailed';
          throw conflict;
        }
        throw err;
      } finally {
        fs.rmSync(tmp, {force: true});
      }
      fs.writeFileSync(
        metaPath(key),
        JSON.stringify({
          etag: `"${sha256Hex(bodyBuf)}"`,
          sha256,
          bytes: bodyBuf.length,
          contentType,
          cacheControl
        })
      );
    },

    async headObject(key) {
      let target = objPath(key);
      if (!fs.existsSync(target)) {
        return null;
      }
      let buf = fs.readFileSync(target);
      let meta = fs.existsSync(metaPath(key))
        ? JSON.parse(fs.readFileSync(metaPath(key), 'utf8'))
        : {};
      return {
        bytes: buf.length,
        sha256: meta.sha256 || sha256Hex(buf),
        etag: meta.etag || `"${sha256Hex(buf)}"`,
        cacheControl: meta.cacheControl || null
      };
    },

    async getConditionalObject(key) {
      let target = objPath(key);
      if (!fs.existsSync(target)) {
        return null;
      }
      let buf = fs.readFileSync(target);
      let etag = `"${sha256Hex(buf)}"`;
      return {body: buf.toString('utf8'), etag};
    },

    async putConditionalObject(key, bodyStr, {ifMatch, ifNoneMatch, contentType, cacheControl}) {
      let target = objPath(key);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      let lockFile = `${target}.__caslock__`;
      // Atomic single-writer critical section simulating S3 conditional PutObject
      let fd;
      try {
        fd = fs.openSync(lockFile, 'wx');
      } catch {
        const err = new Error('PreconditionFailed: concurrent conditional write');
        err.code = 'PreconditionFailed';
        throw err;
      }
      try {
        let exists = fs.existsSync(target);
        if (ifNoneMatch === '*' && exists) {
          const err = new Error('PreconditionFailed: object already exists');
          err.code = 'PreconditionFailed';
          throw err;
        }
        if (ifMatch) {
          if (!exists) {
            const err = new Error('PreconditionFailed: object missing for If-Match');
            err.code = 'PreconditionFailed';
            throw err;
          }
          let currentEtag = `"${sha256Hex(fs.readFileSync(target))}"`;
          if (currentEtag !== ifMatch) {
            const err = new Error(
              `PreconditionFailed: expected ETag ${ifMatch}, actual ${currentEtag}`
            );
            err.code = 'PreconditionFailed';
            throw err;
          }
        }
        let buf = Buffer.from(bodyStr, 'utf8');
        let newEtag = `"${sha256Hex(buf)}"`;
        let tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
        fs.writeFileSync(tmp, buf);
        fs.renameSync(tmp, target);
        fs.writeFileSync(
          metaPath(key),
          JSON.stringify({
            etag: newEtag,
            sha256: sha256Hex(buf),
            bytes: buf.length,
            contentType,
            cacheControl
          })
        );
        return {etag: newEtag};
      } finally {
        fs.closeSync(fd);
        fs.rmSync(lockFile, {force: true});
      }
    }
  };
}

async function runWithConcurrency(items, concurrency, worker) {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  let cursor = 0;
  await Promise.all(
    Array.from({length: limit}, async () => {
      while (cursor < items.length) {
        let index = cursor++;
        await worker(items[index], index);
      }
    })
  );
}

export function isS3NotFoundError(err) {
  let text = String(err?.stderr || err?.message || '');
  return /\b(404|NotFound|NoSuchKey)\b/i.test(text) || /Not Found/i.test(text);
}

/**
 * Storage adapter backed by `aws s3api` with native S3 conditional writes (`--if-match` /
 * `--if-none-match`). Uses async subprocess execution so uploads and verifications can run with
 * bounded concurrency.
 */
export function createAwsS3Storage(bucketName, prefix = 'snapshots', options = {}) {
  const execAws = options.execAws || execFileAsync;
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '');
  const fullKey = relKey => (cleanPrefix ? `${cleanPrefix}/${relKey}` : relKey);

  return {
    async putImmutableObject(relKey, bodyBuf, {sha256, contentType, cacheControl}) {
      let tmpFile = path.join(os.tmpdir(), `rsp-s3-put-${process.pid}-${crypto.randomUUID()}`);
      fs.writeFileSync(tmpFile, bodyBuf);
      try {
        await execAws('aws', [
          's3api',
          'put-object',
          '--bucket',
          bucketName,
          '--key',
          fullKey(relKey),
          '--body',
          tmpFile,
          '--content-type',
          contentType,
          '--cache-control',
          cacheControl,
          '--metadata',
          `sha256=${sha256}`,
          '--if-none-match',
          '*'
        ]);
      } catch (err) {
        let stderr = String(err.stderr || err.message || '');
        if (
          stderr.includes('PreconditionFailed') ||
          stderr.includes('ConditionalRequestConflict')
        ) {
          const conflict = new Error(
            `Immutable object already exists (concurrent publish?): ${fullKey(relKey)}`
          );
          conflict.code = 'PreconditionFailed';
          throw conflict;
        }
        throw err;
      } finally {
        fs.rmSync(tmpFile, {force: true});
      }
    },

    async headObject(relKey) {
      try {
        let {stdout} = await execAws('aws', [
          's3api',
          'head-object',
          '--bucket',
          bucketName,
          '--key',
          fullKey(relKey),
          '--output',
          'json'
        ]);
        let parsed = JSON.parse(stdout);
        return {
          bytes: parsed.ContentLength,
          sha256: parsed.Metadata?.sha256 || null,
          etag: parsed.ETag,
          cacheControl: parsed.CacheControl || null
        };
      } catch (err) {
        if (isS3NotFoundError(err)) {
          return null;
        }
        throw err;
      }
    },

    async getConditionalObject(relKey) {
      let tmpOut = path.join(os.tmpdir(), `rsp-s3-get-${process.pid}-${crypto.randomUUID()}`);
      try {
        let {stdout: metaOut} = await execAws('aws', [
          's3api',
          'get-object',
          '--bucket',
          bucketName,
          '--key',
          fullKey(relKey),
          tmpOut,
          '--output',
          'json'
        ]);
        let meta = JSON.parse(metaOut);
        return {
          body: fs.readFileSync(tmpOut, 'utf8'),
          etag: meta.ETag
        };
      } catch (err) {
        if (isS3NotFoundError(err)) {
          return null;
        }
        throw err;
      } finally {
        fs.rmSync(tmpOut, {force: true});
      }
    },

    async putConditionalObject(relKey, bodyStr, {ifMatch, ifNoneMatch, contentType, cacheControl}) {
      let tmpFile = path.join(os.tmpdir(), `rsp-s3-idx-${process.pid}-${crypto.randomUUID()}`);
      fs.writeFileSync(tmpFile, bodyStr, 'utf8');
      try {
        let args = [
          's3api',
          'put-object',
          '--bucket',
          bucketName,
          '--key',
          fullKey(relKey),
          '--body',
          tmpFile,
          '--content-type',
          contentType,
          '--cache-control',
          cacheControl,
          '--output',
          'json'
        ];
        if (ifMatch) {
          args.push('--if-match', ifMatch);
        } else if (ifNoneMatch) {
          args.push('--if-none-match', ifNoneMatch);
        }
        let {stdout} = await execAws('aws', args);
        return {etag: JSON.parse(stdout).ETag};
      } catch (err) {
        let stderr = String(err.stderr || err.message || '');
        if (
          stderr.includes('PreconditionFailed') ||
          stderr.includes('ConditionalRequestConflict')
        ) {
          const conflict = new Error(`S3 conditional write conflict on ${fullKey(relKey)}`);
          conflict.code = 'PreconditionFailed';
          throw conflict;
        }
        throw err;
      } finally {
        fs.rmSync(tmpFile, {force: true});
      }
    }
  };
}

/**
 * Uploads an immutable object only if it doesn't exist yet. Immutable objects are cached for a
 * year, so existing objects with different content are never overwritten.
 */
async function uploadImmutableIfAbsent(storage, item, buf) {
  const assertMatches = existing => {
    if (existing.sha256 !== item.expectedSha256 || existing.bytes !== item.expectedBytes) {
      throw new Error(
        `Refusing to overwrite immutable object '${item.key}': remote has ${existing.sha256 || 'unknown SHA-256'} (${existing.bytes}B), expected ${item.expectedSha256} (${item.expectedBytes}B). Publish under a new snapshot ID instead.`
      );
    }
  };
  let existing = await storage.headObject(item.key);
  if (existing) {
    assertMatches(existing);
    return;
  }
  try {
    await storage.putImmutableObject(item.key, buf, {
      sha256: item.expectedSha256,
      contentType: contentTypeForPath(item.key),
      cacheControl: IMMUTABLE_CACHE_CONTROL
    });
  } catch (err) {
    if (err?.code === 'PreconditionFailed') {
      let raced = await storage.headObject(item.key);
      if (raced) {
        assertMatches(raced);
        return;
      }
    }
    throw err;
  }
}

/**
 * Executes the 3-step verified & conditional publication protocol for all snapshots
 * staged in `stagedDir`.
 */
export async function publishStagedSnapshots({
  stagedDir,
  storage,
  snapshotIds = null,
  dryRun = false,
  maxCasRetries = 5,
  concurrency = 16,
  onBeforeCasPut = null
}) {
  let stagedIndexPath = path.join(stagedDir, 'index.json');
  if (!fs.existsSync(stagedIndexPath)) {
    throw new Error(`Staged index.json not found at ${stagedIndexPath}`);
  }
  let fullStagedIndex = JSON.parse(fs.readFileSync(stagedIndexPath, 'utf8'));
  let targetIds = snapshotIds || Object.keys(fullStagedIndex.snapshots || {});
  if (targetIds.length === 0) {
    throw new Error(`No snapshots found in ${stagedIndexPath}`);
  }

  let objectsToPublish = [];

  // STEP 1: Verify local integrity and upload all immutable objects under `by-id/<snapshotId>/**`
  for (let snapId of targetIds) {
    let manifestRel = `by-id/${snapId}/manifest.json`;
    let manifestDisk = path.join(stagedDir, ...manifestRel.split('/'));
    if (!fs.existsSync(manifestDisk)) {
      throw new Error(`Missing manifest.json for snapshot ${snapId}: ${manifestDisk}`);
    }
    let manifest = JSON.parse(fs.readFileSync(manifestDisk, 'utf8'));
    let filesMap = manifest.files || {};

    let allRelFiles = [
      ...Object.keys(filesMap).map(rel => ({
        key: `by-id/${snapId}/${rel}`,
        diskPath: path.join(stagedDir, 'by-id', snapId, ...rel.split('/')),
        expectedSha256: filesMap[rel].sha256,
        expectedBytes: filesMap[rel].bytes
      }))
    ];
    let manifestBuf = fs.readFileSync(manifestDisk);
    allRelFiles.push({
      key: manifestRel,
      diskPath: manifestDisk,
      expectedSha256: sha256Hex(manifestBuf),
      expectedBytes: manifestBuf.length
    });

    for (let item of allRelFiles) {
      let buf = fs.readFileSync(item.diskPath);
      let actualSha = sha256Hex(buf);
      if (actualSha !== item.expectedSha256 || buf.length !== item.expectedBytes) {
        throw new Error(
          `Local integrity check failed before upload for ${item.key}: expected ${item.expectedSha256} (${item.expectedBytes}B), got ${actualSha} (${buf.length}B)`
        );
      }
      objectsToPublish.push({item, buf});
    }
  }

  if (dryRun) {
    return {
      dryRun: true,
      snapshotIds: targetIds,
      verifiedObjects: objectsToPublish.length
    };
  }

  await runWithConcurrency(objectsToPublish, concurrency, async ({item, buf}) => {
    await uploadImmutableIfAbsent(storage, item, buf);
  });

  // STEP 2: Verify completeness & SHA-256 of EVERY uploaded object BEFORE touching `index.json`!
  await runWithConcurrency(objectsToPublish, concurrency, async ({item}) => {
    let head = await storage.headObject(item.key);
    if (!head) {
      throw new Error(`Post-upload verification failed: missing remote object '${item.key}'`);
    }
    if (head.bytes !== item.expectedBytes) {
      throw new Error(
        `Post-upload byte size mismatch on '${item.key}': expected ${item.expectedBytes}, got ${head.bytes}`
      );
    }
    if (head.sha256 !== item.expectedSha256) {
      throw new Error(
        `Post-upload SHA-256 mismatch on '${item.key}': expected ${item.expectedSha256}, got ${head.sha256 || 'missing'}`
      );
    }
  });
  let uploadedObjects = objectsToPublish.map(entry => entry.item);

  // Subset `fullStagedIndex` to only `targetIds` if filtered
  let filteredStagedIndex = fullStagedIndex;
  if (snapshotIds) {
    let idSet = new Set(targetIds);
    let subSnapshots = Object.fromEntries(
      Object.entries(fullStagedIndex.snapshots || {}).filter(([id]) => idSet.has(id))
    );
    let subPackages = {};
    for (let [pkg, verMap] of Object.entries(fullStagedIndex.packages || {})) {
      let kept = Object.fromEntries(
        Object.entries(verMap).filter(([, ptr]) => idSet.has(ptr.snapshotId))
      );
      if (Object.keys(kept).length > 0) {
        subPackages[pkg] = kept;
      }
    }
    let subChannels = {};
    for (let [channelName, pkgMap] of Object.entries(fullStagedIndex.channels || {})) {
      let kept = Object.fromEntries(
        Object.entries(pkgMap || {}).filter(([, ptr]) => idSet.has(ptr.snapshotId))
      );
      if (Object.keys(kept).length > 0) {
        subChannels[channelName] = kept;
      }
    }
    filteredStagedIndex = {
      ...fullStagedIndex,
      snapshots: subSnapshots,
      packages: subPackages,
      ...(Object.keys(subChannels).length > 0 ? {channels: subChannels} : {channels: undefined})
    };
  }

  // STEP 3: Conditional ETag CAS loop on `index.json`
  for (let attempt = 1; attempt <= maxCasRetries; attempt++) {
    let currentRemote = await storage.getConditionalObject('index.json');
    let remoteParsed = currentRemote ? JSON.parse(currentRemote.body) : null;
    let mergedIndex = mergeSnapshotIndices(remoteParsed, filteredStagedIndex);
    let mergedStr = JSON.stringify(mergedIndex, null, 2) + '\n';

    if (onBeforeCasPut) {
      await onBeforeCasPut({attempt, currentEtag: currentRemote?.etag || null});
    }

    try {
      let putRes = await storage.putConditionalObject('index.json', mergedStr, {
        ifMatch: currentRemote ? currentRemote.etag : undefined,
        ifNoneMatch: currentRemote ? undefined : '*',
        contentType: 'application/json;charset=utf-8',
        cacheControl: INDEX_CACHE_CONTROL
      });
      return {
        dryRun: false,
        snapshotIds: targetIds,
        verifiedObjects: uploadedObjects.length,
        indexEtag: putRes.etag,
        casAttempts: attempt
      };
    } catch (err) {
      if (err.code === 'PreconditionFailed' && attempt < maxCasRetries) {
        await new Promise(resolve => setTimeout(resolve, 40 * attempt));
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Exceeded max CAS retries (${maxCasRetries}) updating index.json`);
}

async function main() {
  const {values} = parseArgs({
    options: {
      'staged-dir': {type: 'string'},
      bucket: {type: 'string'},
      prefix: {type: 'string'},
      'local-bucket-dir': {type: 'string'},
      snapshot: {type: 'string', multiple: true},
      'dry-run': {type: 'boolean'},
      help: {type: 'boolean', short: 'h'}
    }
  });

  if (values.help) {
    console.log(
      [
        'Usage: node packages/dev/s2-docs/scripts/publishSnapshots.mjs [options]',
        '',
        'Options:',
        '  --staged-dir <dir>         Local snapshot build directory (default: packages/dev/s2-docs/dist/snapshots)',
        '  --bucket <s3-bucket-name>  Target AWS S3 bucket name (without s3://)',
        '  --prefix <key-prefix>      Target S3 key prefix (default: snapshots)',
        '  --local-bucket-dir <dir>   Publish into a local directory simulating S3 conditional writes',
        '  --snapshot <id>            Publish only specific snapshot ID(s) (repeatable)',
        '  --dry-run                  Validate hashes and object list without uploading'
      ].join('\n')
    );
    return;
  }

  const stagedDir = path.resolve(
    values['staged-dir'] || path.join(REPO_ROOT, 'packages/dev/s2-docs/dist/snapshots')
  );
  const storage = values['local-bucket-dir']
    ? createLocalBucketStorage(path.resolve(values['local-bucket-dir']))
    : values.bucket
      ? createAwsS3Storage(
          values.bucket.replace(/^s3:\/\//, '').split('/')[0],
          values.prefix || 'snapshots'
        )
      : null;

  if (!storage && !values['dry-run']) {
    throw new Error('Provide either --bucket <s3-bucket>, --local-bucket-dir <dir>, or --dry-run.');
  }

  const res = await publishStagedSnapshots({
    stagedDir,
    storage,
    snapshotIds: values.snapshot?.length ? values.snapshot : null,
    dryRun: Boolean(values['dry-run'])
  });
  console.log(
    `Published ${res.snapshotIds.length} snapshot(s) (${res.verifiedObjects} verified objects${res.casAttempts ? `, CAS attempts: ${res.casAttempts}` : ''}).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
