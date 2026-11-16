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

import {
  AgentDocsError,
  CatalogEntryIR,
  DEFAULT_SNAPSHOT_CDN_URL,
  EXIT_CODES,
  PackageSlicePointer,
  READER_SCHEMA_VERSION,
  S2Assets,
  SearchIndexRecord,
  SnapshotIndex,
  SnapshotManifest,
  SnapshotSummaryInfo
} from './types.js';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {unpackTarGzBufferToDir} from './tar.js';

const INDEX_TTL_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 60 * 1000;
const MAX_INDEX_BYTES = 32 * 1024 * 1024;
const MAX_SLICE_BYTES = 64 * 1024 * 1024;

export function resolveDefaultCacheDir(explicitCacheDir?: string): string {
  if (explicitCacheDir) {
    return path.resolve(explicitCacheDir);
  }
  if (process.env.RSP_AGENT_DOCS_CACHE_DIR) {
    return path.resolve(process.env.RSP_AGENT_DOCS_CACHE_DIR);
  }
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Caches', 'adobe-spectrum-agent-docs');
  }
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    return path.join(localAppData, 'adobe-spectrum-agent-docs');
  }
  const xdg = process.env.XDG_CACHE_HOME || path.join(home, '.cache');
  return path.join(xdg, 'adobe-spectrum-agent-docs');
}

export function resolveSnapshotSource(explicitSource?: string): string {
  return (
    explicitSource ||
    process.env.RSP_AGENT_DOCS_SNAPSHOT_SOURCE ||
    process.env.RSP_AGENT_DOCS_SNAPSHOT_URL ||
    DEFAULT_SNAPSHOT_CDN_URL
  ).replace(/\/+$/, '');
}

function isLocalSource(source: string): boolean {
  return !/^https?:\/\//i.test(source);
}

function localSourcePath(source: string): string {
  if (source.startsWith('file://')) {
    return decodeURIComponent(new URL(source).pathname);
  }
  return path.resolve(source);
}

function sha256Buffer(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function fetchSourceBytes(
  source: string,
  relPath: string,
  offline: boolean,
  maxBytes: number
): Promise<Buffer> {
  const cleanRel = relPath.replace(/^\/+/, '');
  if (isLocalSource(source)) {
    const fullPath = path.join(localSourcePath(source), cleanRel);
    if (!fs.existsSync(fullPath)) {
      throw new AgentDocsError(
        'ERR_SNAPSHOT_NOT_FOUND',
        `Snapshot artifact not found at local source: ${fullPath}`,
        EXIT_CODES.NOT_FOUND
      );
    }
    if (fs.statSync(fullPath).size > maxBytes) {
      throw downloadTooLargeError(fullPath, maxBytes);
    }
    return fs.readFileSync(fullPath);
  }

  if (offline) {
    throw new AgentDocsError(
      'ERR_OFFLINE_CACHE_MISS',
      `Offline mode is enabled and '${cleanRel}' is not present in local cache. Run 'prefetch' while online first.`,
      EXIT_CODES.OFFLINE_OR_NETWORK
    );
  }

  const url = `${source}/${cleanRel}`;
  try {
    const response = await fetch(url, {
      headers: {'User-Agent': 'adobe-spectrum-agent-docs/1.0'},
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });

    if (response.status === 404) {
      throw new AgentDocsError(
        'ERR_SNAPSHOT_NOT_FOUND',
        `Snapshot artifact not found at '${url}' (HTTP 404).`,
        EXIT_CODES.NOT_FOUND
      );
    }
    if (!response.ok) {
      throw new AgentDocsError(
        'ERR_NETWORK_FETCH',
        `Snapshot fetch failed for '${url}' (HTTP ${response.status}).`,
        EXIT_CODES.OFFLINE_OR_NETWORK
      );
    }

    const declaredLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      throw downloadTooLargeError(url, maxBytes);
    }
    if (!response.body) {
      return Buffer.alloc(0);
    }
    const chunks: Buffer[] = [];
    let total = 0;
    const reader = response.body.getReader();
    for (;;) {
      const {done, value} = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw downloadTooLargeError(url, maxBytes);
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, total);
  } catch (err) {
    if (err instanceof AgentDocsError) {
      throw err;
    }
    throw new AgentDocsError(
      'ERR_NETWORK_FETCH',
      `Failed to fetch '${url}': ${err instanceof Error ? err.message : String(err)}`,
      EXIT_CODES.OFFLINE_OR_NETWORK
    );
  }
}

function downloadTooLargeError(location: string, maxBytes: number): AgentDocsError {
  return new AgentDocsError(
    'ERR_CACHE_INTEGRITY',
    `Snapshot artifact '${location}' exceeds the expected size of ${maxBytes} bytes.`,
    EXIT_CODES.INTEGRITY_OR_SCHEMA
  );
}

function assertCompatibleSchema(
  minReaderSchemaVersion: number | undefined,
  contextLabel: string
): void {
  const required = minReaderSchemaVersion ?? 1;
  if (required > READER_SCHEMA_VERSION) {
    throw new AgentDocsError(
      'ERR_CATALOG_SCHEMA_TOO_NEW',
      `${contextLabel} requires reader schemaVersion >= ${required}, but this CLI supports up to schemaVersion ${READER_SCHEMA_VERSION}. Upgrade @react-spectrum/cli or @react-aria/cli.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
}

export interface CacheAccessOptions {
  cacheDir?: string;
  snapshotSource?: string;
  offline?: boolean;
  forceRefreshIndex?: boolean;
}

/**
 * Loads `index.json` with ETag/TTL caching, offline fallback, and `minReaderSchemaVersion` guard.
 */
export async function loadSnapshotIndex(options: CacheAccessOptions = {}): Promise<SnapshotIndex> {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const source = resolveSnapshotSource(options.snapshotSource);
  const offline = Boolean(options.offline || process.env.RSP_AGENT_DOCS_OFFLINE === '1');

  fs.mkdirSync(cacheDir, {recursive: true});
  const sourceHash = crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
  const cachedIndexPath = path.join(cacheDir, `index-${sourceHash}.json`);

  // For local directory sources, always read directly for zero-stale developer/bench loops unless offline-only cached
  if (isLocalSource(source)) {
    const localIdx = path.join(localSourcePath(source), 'index.json');
    if (fs.existsSync(localIdx)) {
      const parsed = JSON.parse(fs.readFileSync(localIdx, 'utf8')) as SnapshotIndex;
      assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Snapshot index');
      return parsed;
    }
    if (fs.existsSync(cachedIndexPath)) {
      const parsed = JSON.parse(fs.readFileSync(cachedIndexPath, 'utf8')) as SnapshotIndex;
      assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Cached snapshot index');
      return parsed;
    }
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `Snapshot index.json not found at '${localIdx}'.`,
      EXIT_CODES.NOT_FOUND
    );
  }

  if (fs.existsSync(cachedIndexPath) && !options.forceRefreshIndex) {
    const stat = fs.statSync(cachedIndexPath);
    if (offline || Date.now() - stat.mtimeMs < INDEX_TTL_MS) {
      const parsed = JSON.parse(fs.readFileSync(cachedIndexPath, 'utf8')) as SnapshotIndex;
      assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Cached snapshot index');
      return parsed;
    }
  }

  try {
    const raw = await fetchSourceBytes(source, 'index.json', offline, MAX_INDEX_BYTES);
    const parsed = JSON.parse(raw.toString('utf8')) as SnapshotIndex;
    assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Snapshot index');
    const tmpPath = `${cachedIndexPath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpPath, raw);
    fs.renameSync(tmpPath, cachedIndexPath);
    return parsed;
  } catch (err) {
    // Graceful stale-if-error fallback when cached index exists
    if (fs.existsSync(cachedIndexPath)) {
      const parsed = JSON.parse(fs.readFileSync(cachedIndexPath, 'utf8')) as SnapshotIndex;
      assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Cached snapshot index');
      return parsed;
    }
    throw err;
  }
}

export async function loadSnapshotManifest(
  snapshot: SnapshotSummaryInfo,
  options: CacheAccessOptions = {}
): Promise<SnapshotManifest> {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const source = resolveSnapshotSource(options.snapshotSource);
  const key = sha256Buffer(Buffer.from(`${source}/${snapshot.manifestPath}`));
  const cachedPath = path.join(cacheDir, 'manifests', `${key}.json`);
  const raw = fs.existsSync(cachedPath)
    ? fs.readFileSync(cachedPath)
    : await fetchSourceBytes(
        source,
        snapshot.manifestPath,
        Boolean(options.offline || process.env.RSP_AGENT_DOCS_OFFLINE === '1'),
        snapshot.manifestBytes || MAX_INDEX_BYTES
      );
  if (
    (snapshot.manifestSha256 && sha256Buffer(raw) !== snapshot.manifestSha256) ||
    (snapshot.manifestBytes !== undefined && raw.length !== snapshot.manifestBytes)
  ) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Integrity mismatch for snapshot manifest '${snapshot.manifestPath}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const manifest = JSON.parse(raw.toString('utf8')) as SnapshotManifest;
  assertCompatibleSchema(manifest.minReaderSchemaVersion, `Snapshot ${snapshot.snapshotId}`);
  if (manifest.snapshotId !== snapshot.snapshotId || !manifest.slices) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid package slice manifest for snapshot '${snapshot.snapshotId}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  if (!fs.existsSync(cachedPath)) {
    fs.mkdirSync(path.dirname(cachedPath), {recursive: true});
    const tmpPath = `${cachedPath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpPath, raw);
    fs.renameSync(tmpPath, cachedPath);
  }
  return manifest;
}

function sanitizePackageCacheSeg(pkgName: string, version: string, sliceSha256: string): string {
  const safeName = pkgName.replace(/^@/, '').replace(/\//g, '__');
  return `${safeName}@${version}-${sliceSha256.slice(0, 12)}`;
}

function acquireLockSync(lockPath: string, timeoutMs = 15_000): () => void {
  const start = Date.now();
  while (true) {
    try {
      const fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, `${process.pid}:${Date.now()}`);
      fs.closeSync(fd);
      return () => {
        try {
          fs.unlinkSync(lockPath);
        } catch {
          // ignore cleanup race
        }
      };
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== 'EEXIST') {
        throw err;
      }
      // Clear stale lock older than 30s
      try {
        const stat = fs.statSync(lockPath);
        if (Date.now() - stat.mtimeMs > 30_000) {
          fs.unlinkSync(lockPath);
          continue;
        }
      } catch {
        continue;
      }
      if (Date.now() - start > timeoutMs) {
        throw new AgentDocsError(
          'ERR_CACHE_INTEGRITY',
          `Timed out waiting for cache extraction lock '${lockPath}'.`,
          EXIT_CODES.INTEGRITY_OR_SCHEMA
        );
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
    }
  }
}

/**
 * Ensures a per-package slice `.tar.gz` is downloaded, SHA-256 verified, and atomically unpacked.
 */
export async function ensurePackageSliceExtracted(
  packageName: string,
  packageVersion: string,
  pointer: PackageSlicePointer,
  options: CacheAccessOptions = {}
): Promise<string> {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const source = resolveSnapshotSource(options.snapshotSource);
  const offline = Boolean(options.offline || process.env.RSP_AGENT_DOCS_OFFLINE === '1');

  const slicesRoot = path.join(cacheDir, 'slices');
  fs.mkdirSync(slicesRoot, {recursive: true});

  const sliceKey = sanitizePackageCacheSeg(packageName, packageVersion, pointer.sliceSha256);
  const targetDir = path.join(slicesRoot, sliceKey);
  const readyMarker = path.join(targetDir, '.ready.json');

  if (fs.existsSync(readyMarker)) {
    return targetDir;
  }

  // Fetch bytes before taking synchronous directory lock
  const gzBytes = await fetchSourceBytes(
    source,
    pointer.sliceRelPath,
    offline,
    pointer.sliceBytes || MAX_SLICE_BYTES
  );
  if (pointer.sliceBytes && gzBytes.length !== pointer.sliceBytes) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Byte length mismatch for slice '${pointer.sliceRelPath}': expected ${pointer.sliceBytes}, got ${gzBytes.length}.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const actualSha = sha256Buffer(gzBytes);
  if (actualSha !== pointer.sliceSha256) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `SHA-256 integrity mismatch for slice '${pointer.sliceRelPath}': expected ${pointer.sliceSha256}, got ${actualSha}.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }

  const lockPath = path.join(slicesRoot, `${sliceKey}.lock`);
  const release = acquireLockSync(lockPath);
  try {
    if (fs.existsSync(readyMarker)) {
      return targetDir;
    }
    const stagingDir = path.join(slicesRoot, `${sliceKey}.tmp-${process.pid}-${Date.now()}`);
    try {
      unpackTarGzBufferToDir(gzBytes, stagingDir);
      const sliceMetaPath = path.join(stagingDir, 'slice-manifest.json');
      if (fs.existsSync(sliceMetaPath)) {
        const meta = JSON.parse(fs.readFileSync(sliceMetaPath, 'utf8'));
        assertCompatibleSchema(
          meta.minReaderSchemaVersion,
          `Package slice ${packageName}@${packageVersion}`
        );
      }
      fs.writeFileSync(
        path.join(stagingDir, '.ready.json'),
        JSON.stringify({verifiedSha256: actualSha, extractedAt: new Date().toISOString()})
      );
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, {recursive: true, force: true});
      }
      fs.renameSync(stagingDir, targetDir);
    } finally {
      if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, {recursive: true, force: true});
      }
    }
  } finally {
    release();
  }

  return targetDir;
}

export function readSliceSearchIndex(sliceDir: string): SearchIndexRecord[] {
  const p = path.join(sliceDir, 'search-index.json');
  if (!fs.existsSync(p)) {
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
  return (Array.isArray(parsed) ? parsed : parsed.entries || []) as SearchIndexRecord[];
}

/**
 * Returns true if a doc slug is a safe relative path: non-empty, no null bytes, no backslashes,
 * no absolute or drive-letter prefix, and no `.`/`..`/empty segments.
 */
export function isSafeEntrySlug(slug: string): boolean {
  if (!slug || slug.includes('\0') || slug.includes('\\')) {
    return false;
  }
  if (slug.startsWith('/') || /^[a-zA-Z]:/.test(slug)) {
    return false;
  }
  return slug.split('/').every(seg => seg !== '' && seg !== '.' && seg !== '..');
}

export function readSliceEntryBySlug(
  sliceDir: string,
  library: string,
  slug: string
): {entry: CatalogEntryIR; markdown: string} | null {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!isSafeEntrySlug(library) || !isSafeEntrySlug(cleanSlug)) {
    return null;
  }
  const entriesRoot = path.resolve(sliceDir, 'entries');
  const jsonPath = path.resolve(entriesRoot, library, `${cleanSlug}.json`);
  const mdPath = path.resolve(entriesRoot, library, `${cleanSlug}.md`);
  // Defense in depth: never read outside the slice's entries directory.
  if (!jsonPath.startsWith(entriesRoot + path.sep) || !mdPath.startsWith(entriesRoot + path.sep)) {
    return null;
  }
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  const entry = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as CatalogEntryIR;
  assertCompatibleSchema(entry.schemaVersion, `Catalog entry ${entry.id}`);
  const markdown = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
  return {entry, markdown};
}

export function readSliceS2Assets(sliceDir: string): S2Assets | null {
  const p = path.join(sliceDir, 's2-assets.json');
  if (!fs.existsSync(p)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as S2Assets;
}
