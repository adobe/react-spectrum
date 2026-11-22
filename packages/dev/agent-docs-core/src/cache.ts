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
  API_VERSION,
  CacheClearResult,
  CacheStatusResult,
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
import {fileURLToPath} from 'node:url';
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
    return fileURLToPath(source);
  }
  return path.resolve(source);
}

function sha256Buffer(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function assertSafeRelativeArtifactPath(relPath: string): string {
  const cleanRel = relPath.replace(/^\/+/, '');
  if (
    !cleanRel ||
    cleanRel.includes('\0') ||
    cleanRel.includes('\\') ||
    /^[a-zA-Z]:/.test(cleanRel) ||
    !cleanRel.split('/').every(seg => seg !== '' && seg !== '.' && seg !== '..')
  ) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid snapshot artifact path '${relPath}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  return cleanRel;
}

function resolveBoundedMaxBytes(
  declaredBytes: number | undefined,
  hardCap: number,
  location: string
): number {
  if (declaredBytes === undefined) {
    return hardCap;
  }
  if (!Number.isInteger(declaredBytes) || declaredBytes < 0 || declaredBytes > hardCap) {
    throw downloadTooLargeError(location, hardCap);
  }
  return declaredBytes;
}

async function readResponseBytesBounded(
  response: Response,
  url: string,
  maxBytes: number
): Promise<Buffer> {
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
}

async function fetchIndexConditional(
  source: string,
  offline: boolean,
  maxBytes: number,
  ifNoneMatch?: string
): Promise<
  | {notModified: true; etag: string | null}
  | {notModified: false; bytes: Buffer; etag: string | null}
> {
  if (offline) {
    throw new AgentDocsError(
      'ERR_OFFLINE_CACHE_MISS',
      "Offline mode is enabled and 'index.json' is not present in local cache. Run 'prefetch' while online first.",
      EXIT_CODES.OFFLINE_OR_NETWORK
    );
  }

  const url = `${source}/index.json`;
  const headers: Record<string, string> = {'User-Agent': 'adobe-spectrum-agent-docs/1.0'};
  if (ifNoneMatch) {
    headers['If-None-Match'] = ifNoneMatch;
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });

    if (response.status === 304) {
      return {notModified: true, etag: response.headers.get('etag') || ifNoneMatch || null};
    }
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

    const bytes = await readResponseBytesBounded(response, url, maxBytes);
    return {notModified: false, bytes, etag: response.headers.get('etag')};
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

function readCachedIndexEtag(metaPath: string): string | undefined {
  if (!fs.existsSync(metaPath)) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as {etag?: unknown};
    return typeof parsed.etag === 'string' && parsed.etag.trim() ? parsed.etag : undefined;
  } catch {
    try {
      fs.rmSync(metaPath, {force: true});
    } catch {
      // ignore cleanup error
    }
    return undefined;
  }
}

function writeCachedIndexEtag(metaPath: string, etag: string | null): void {
  if (!etag) {
    try {
      fs.rmSync(metaPath, {force: true});
    } catch {
      // ignore cleanup error
    }
    return;
  }
  const tmpPath = `${metaPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify({etag}), 'utf8');
  fs.renameSync(tmpPath, metaPath);
}

async function fetchSourceBytes(
  source: string,
  relPath: string,
  offline: boolean,
  maxBytes: number
): Promise<Buffer> {
  const cleanRel = assertSafeRelativeArtifactPath(relPath);
  if (isLocalSource(source)) {
    const rootDir = path.resolve(localSourcePath(source));
    const fullPath = path.resolve(rootDir, cleanRel);
    if (!fullPath.startsWith(rootDir + path.sep)) {
      throw new AgentDocsError(
        'ERR_CACHE_INTEGRITY',
        `Snapshot artifact path '${relPath}' escapes local source root.`,
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }
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

    return await readResponseBytesBounded(response, url, maxBytes);
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

function readCachedIndexFile(filePath: string): SnapshotIndex | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    try {
      fs.rmSync(filePath, {force: true});
    } catch {
      // ignore cleanup error
    }
    return null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    try {
      fs.rmSync(filePath, {force: true});
    } catch {
      // ignore cleanup error
    }
    return null;
  }
  const index = parsed as SnapshotIndex;
  assertCompatibleSchema(index.minReaderSchemaVersion, 'Cached snapshot index');
  return index;
}

/**
 * Loads `index.json` with TTL caching, conditional ETag (`If-None-Match` / `304 Not Modified`)
 * revalidation, offline fallback, and `minReaderSchemaVersion` guard.
 */
export async function loadSnapshotIndex(options: CacheAccessOptions = {}): Promise<SnapshotIndex> {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const source = resolveSnapshotSource(options.snapshotSource);
  const offline = Boolean(options.offline || process.env.RSP_AGENT_DOCS_OFFLINE === '1');

  fs.mkdirSync(cacheDir, {recursive: true});
  const sourceHash = crypto.createHash('sha256').update(source).digest('hex').slice(0, 12);
  const cachedIndexPath = path.join(cacheDir, `index-${sourceHash}.json`);
  const cachedMetaPath = path.join(cacheDir, `index-${sourceHash}.meta.json`);

  // For local directory sources, always read directly for zero-stale developer/bench loops unless offline-only cached
  if (isLocalSource(source)) {
    const localIdx = path.join(localSourcePath(source), 'index.json');
    if (fs.existsSync(localIdx)) {
      const parsed = JSON.parse(fs.readFileSync(localIdx, 'utf8')) as SnapshotIndex;
      assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Snapshot index');
      return parsed;
    }
    const cached = readCachedIndexFile(cachedIndexPath);
    if (cached) {
      return cached;
    }
    throw new AgentDocsError(
      'ERR_SNAPSHOT_NOT_FOUND',
      `Snapshot index.json not found at '${localIdx}'.`,
      EXIT_CODES.NOT_FOUND
    );
  }

  let cachedOnDisk: SnapshotIndex | null = null;
  if (fs.existsSync(cachedIndexPath)) {
    const stat = fs.statSync(cachedIndexPath);
    cachedOnDisk = readCachedIndexFile(cachedIndexPath);
    if (
      cachedOnDisk &&
      !options.forceRefreshIndex &&
      (offline || Date.now() - stat.mtimeMs < INDEX_TTL_MS)
    ) {
      return cachedOnDisk;
    }
  }

  const cachedEtag = cachedOnDisk ? readCachedIndexEtag(cachedMetaPath) : undefined;

  try {
    const res = await fetchIndexConditional(source, offline, MAX_INDEX_BYTES, cachedEtag);
    if (res.notModified && cachedOnDisk) {
      const now = new Date();
      try {
        fs.utimesSync(cachedIndexPath, now, now);
      } catch {
        // ignore mtime refresh error
      }
      if (res.etag && res.etag !== cachedEtag) {
        writeCachedIndexEtag(cachedMetaPath, res.etag);
      }
      return cachedOnDisk;
    }
    if (res.notModified) {
      throw new AgentDocsError(
        'ERR_NETWORK_FETCH',
        `Received unexpected HTTP 304 for '${source}/index.json' without a cached index.`,
        EXIT_CODES.OFFLINE_OR_NETWORK
      );
    }

    const parsed = JSON.parse(res.bytes.toString('utf8')) as SnapshotIndex;
    assertCompatibleSchema(parsed.minReaderSchemaVersion, 'Snapshot index');
    const tmpPath = `${cachedIndexPath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpPath, res.bytes);
    fs.renameSync(tmpPath, cachedIndexPath);
    writeCachedIndexEtag(cachedMetaPath, res.etag);
    return parsed;
  } catch (err) {
    if (
      err instanceof AgentDocsError &&
      (err.code === 'ERR_CATALOG_SCHEMA_TOO_NEW' || err.code === 'ERR_CACHE_INTEGRITY')
    ) {
      throw err;
    }
    // Graceful stale-if-error fallback when cached index exists
    if (cachedOnDisk) {
      return cachedOnDisk;
    }
    const cached = readCachedIndexFile(cachedIndexPath);
    if (cached) {
      return cached;
    }
    throw err;
  }
}

function parseAndValidateManifest(
  raw: Buffer,
  snapshot: SnapshotSummaryInfo,
  maxManifestBytes: number
): SnapshotManifest {
  if (
    raw.length > maxManifestBytes ||
    (snapshot.manifestSha256 && sha256Buffer(raw) !== snapshot.manifestSha256) ||
    (snapshot.manifestBytes !== undefined && raw.length !== snapshot.manifestBytes)
  ) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Integrity mismatch for snapshot manifest '${snapshot.manifestPath}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  let manifest: SnapshotManifest;
  try {
    manifest = JSON.parse(raw.toString('utf8')) as SnapshotManifest;
  } catch {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Corrupt JSON in snapshot manifest '${snapshot.manifestPath}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  assertCompatibleSchema(manifest.minReaderSchemaVersion, `Snapshot ${snapshot.snapshotId}`);
  if (manifest.snapshotId !== snapshot.snapshotId || !manifest.slices) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid package slice manifest for snapshot '${snapshot.snapshotId}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  return manifest;
}

export async function loadSnapshotManifest(
  snapshot: SnapshotSummaryInfo,
  options: CacheAccessOptions = {}
): Promise<SnapshotManifest> {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const source = resolveSnapshotSource(options.snapshotSource);
  const local = isLocalSource(source);
  const cleanManifestPath = assertSafeRelativeArtifactPath(snapshot.manifestPath);
  const maxManifestBytes = resolveBoundedMaxBytes(
    snapshot.manifestBytes,
    MAX_INDEX_BYTES,
    cleanManifestPath
  );
  const key = sha256Buffer(Buffer.from(`${source}/${cleanManifestPath}`));
  const cachedPath = path.join(cacheDir, 'manifests', `${key}.json`);
  if (!local && fs.existsSync(cachedPath)) {
    try {
      const cachedRaw = fs.readFileSync(cachedPath);
      return parseAndValidateManifest(cachedRaw, snapshot, maxManifestBytes);
    } catch (err) {
      if (err instanceof AgentDocsError && err.code === 'ERR_CATALOG_SCHEMA_TOO_NEW') {
        throw err;
      }
      // Discard corrupt/truncated disk cache entry and re-fetch cleanly
      try {
        fs.rmSync(cachedPath, {force: true});
      } catch {
        // ignore cleanup failure
      }
    }
  }

  const raw = await fetchSourceBytes(
    source,
    cleanManifestPath,
    Boolean(options.offline || process.env.RSP_AGENT_DOCS_OFFLINE === '1'),
    maxManifestBytes
  );
  const manifest = parseAndValidateManifest(raw, snapshot, maxManifestBytes);
  if (!local) {
    fs.mkdirSync(path.dirname(cachedPath), {recursive: true});
    const tmpPath = `${cachedPath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpPath, raw);
    fs.renameSync(tmpPath, cachedPath);
  }
  return manifest;
}

function sanitizePackageCacheSeg(pkgName: string, version: string, sliceSha256: string): string {
  if (
    !pkgName ||
    pkgName.includes('\0') ||
    pkgName.includes('\\') ||
    pkgName.includes('..') ||
    !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(pkgName)
  ) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid package name in slice pointer: '${pkgName}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  if (!version || version.includes('..') || !/^[A-Za-z0-9][A-Za-z0-9._+-]*$/.test(version)) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid package version in slice pointer: '${version}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  if (!/^[0-9a-f]{64}$/i.test(sliceSha256)) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid SHA-256 digest in slice pointer: '${sliceSha256}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const safeName = pkgName.replace(/^@/, '').replace(/\//g, '__');
  return `${safeName}@${version}-${sliceSha256.toLowerCase().slice(0, 12)}`;
}

async function acquireLock(lockPath: string, timeoutMs = 15_000): Promise<() => void> {
  const start = Date.now();
  while (true) {
    try {
      const handle = await fs.promises.open(lockPath, 'wx');
      try {
        await handle.writeFile(`${process.pid}:${Date.now()}`);
      } finally {
        await handle.close();
      }
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
        const stat = await fs.promises.stat(lockPath);
        if (Date.now() - stat.mtimeMs > 30_000) {
          await fs.promises.unlink(lockPath);
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
      await new Promise(resolve => setTimeout(resolve, 25));
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

  const slicesRoot = path.resolve(cacheDir, 'slices');
  fs.mkdirSync(slicesRoot, {recursive: true});

  const sliceKey = sanitizePackageCacheSeg(packageName, packageVersion, pointer.sliceSha256);
  const targetDir = path.resolve(slicesRoot, sliceKey);
  if (path.dirname(targetDir) !== slicesRoot) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Invalid cache target directory for slice '${sliceKey}'.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const readyMarker = path.join(targetDir, '.ready.json');

  if (fs.existsSync(readyMarker)) {
    return targetDir;
  }

  const maxSliceBytes = resolveBoundedMaxBytes(
    pointer.sliceBytes,
    MAX_SLICE_BYTES,
    pointer.sliceRelPath
  );

  // Fetch bytes before taking directory lock
  const gzBytes = await fetchSourceBytes(source, pointer.sliceRelPath, offline, maxSliceBytes);
  if (pointer.sliceBytes !== undefined && gzBytes.length !== pointer.sliceBytes) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `Byte length mismatch for slice '${pointer.sliceRelPath}': expected ${pointer.sliceBytes}, got ${gzBytes.length}.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const actualSha = sha256Buffer(gzBytes);
  if (actualSha !== pointer.sliceSha256.toLowerCase()) {
    throw new AgentDocsError(
      'ERR_CACHE_INTEGRITY',
      `SHA-256 integrity mismatch for slice '${pointer.sliceRelPath}': expected ${pointer.sliceSha256}, got ${actualSha}.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }

  const lockPath = path.join(slicesRoot, `${sliceKey}.lock`);
  const release = await acquireLock(lockPath);
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
): {entry: CatalogEntryIR} | null {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!isSafeEntrySlug(library) || !isSafeEntrySlug(cleanSlug)) {
    return null;
  }
  const entriesRoot = path.resolve(sliceDir, 'entries');
  const jsonPath = path.resolve(entriesRoot, library, `${cleanSlug}.json`);
  // Defense in depth: never read outside the slice's entries directory.
  if (!jsonPath.startsWith(entriesRoot + path.sep)) {
    return null;
  }
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  const entry = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as CatalogEntryIR;
  assertCompatibleSchema(entry.minReaderSchemaVersion, `Catalog entry ${entry.id}`);
  return {entry};
}

export function readSliceS2Assets(sliceDir: string): S2Assets | null {
  const p = path.join(sliceDir, 's2-assets.json');
  if (!fs.existsSync(p)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as S2Assets;
}

function measureDirectoryBytes(targetPath: string): number {
  let total = 0;
  const stat = fs.lstatSync(targetPath);
  if (stat.isFile()) {
    return stat.size;
  }
  if (!stat.isDirectory()) {
    return 0;
  }
  for (const entry of fs.readdirSync(targetPath, {withFileTypes: true})) {
    const child = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      total += measureDirectoryBytes(child);
    } else if (entry.isFile()) {
      total += fs.lstatSync(child).size;
    }
  }
  return total;
}

function readSliceExtractedAt(slicePath: string): string | null {
  const readyPath = path.join(slicePath, '.ready.json');
  if (!fs.existsSync(readyPath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(readyPath, 'utf8')) as {extractedAt?: unknown};
    return typeof parsed.extractedAt === 'string' ? parsed.extractedAt : null;
  } catch {
    return null;
  }
}

export function getCacheStatus(options: {cacheDir?: string} = {}): CacheStatusResult {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  if (!fs.existsSync(cacheDir)) {
    return {
      apiVersion: API_VERSION,
      cacheDir,
      exists: false,
      indexCount: 0,
      manifestCount: 0,
      sliceCount: 0,
      totalBytes: 0,
      slices: []
    };
  }

  let indexCount = 0;
  for (const entry of fs.readdirSync(cacheDir, {withFileTypes: true})) {
    if (
      entry.isFile() &&
      entry.name.startsWith('index-') &&
      entry.name.endsWith('.json') &&
      !entry.name.endsWith('.meta.json')
    ) {
      indexCount++;
    }
  }

  const manifestsDir = path.join(cacheDir, 'manifests');
  let manifestCount = 0;
  if (fs.existsSync(manifestsDir)) {
    for (const entry of fs.readdirSync(manifestsDir, {withFileTypes: true})) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        manifestCount++;
      }
    }
  }

  const slicesDir = path.join(cacheDir, 'slices');
  const slices: CacheStatusResult['slices'] = [];
  if (fs.existsSync(slicesDir)) {
    for (const entry of fs.readdirSync(slicesDir, {withFileTypes: true})) {
      if (!entry.isDirectory() || entry.name.includes('.tmp-')) {
        continue;
      }
      const slicePath = path.join(slicesDir, entry.name);
      slices.push({
        key: entry.name,
        bytes: measureDirectoryBytes(slicePath),
        extractedAt: readSliceExtractedAt(slicePath)
      });
    }
    slices.sort((a, b) => a.key.localeCompare(b.key));
  }

  return {
    apiVersion: API_VERSION,
    cacheDir,
    exists: true,
    indexCount,
    manifestCount,
    sliceCount: slices.length,
    totalBytes: measureDirectoryBytes(cacheDir),
    slices
  };
}

export function clearCacheDir(options: {cacheDir?: string} = {}): CacheClearResult {
  const cacheDir = resolveDefaultCacheDir(options.cacheDir);
  const resolved = path.resolve(cacheDir);
  const home = path.resolve(os.homedir());
  if (path.dirname(resolved) === resolved || resolved === home) {
    throw new AgentDocsError(
      'ERR_INVALID_ARGS',
      `Refusing to clear unsafe cache directory '${resolved}'.`,
      EXIT_CODES.INVALID_ARGS
    );
  }
  const status = getCacheStatus({cacheDir: resolved});
  if (!status.exists) {
    return {
      apiVersion: API_VERSION,
      cacheDir: resolved,
      cleared: false,
      removedBytes: 0
    };
  }
  fs.rmSync(resolved, {recursive: true, force: true});
  return {
    apiVersion: API_VERSION,
    cacheDir: resolved,
    cleared: true,
    removedBytes: status.totalBytes
  };
}
