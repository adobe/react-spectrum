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

import {AgentDocsError, EXIT_CODES} from './types.js';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BLOCK_SIZE = 512;
const DEFAULT_MAX_UNCOMPRESSED_BYTES = 128 * 1024 * 1024;
const DEFAULT_MAX_FILES = 10_000;

function readNullTermString(buf: Buffer, offset: number, length: number): string {
  let end = offset;
  const max = offset + length;
  while (end < max && buf[end] !== 0) {
    end++;
  }
  return buf.subarray(offset, end).toString('utf8');
}

function parseOctal(buf: Buffer, offset: number, length: number): number {
  const str = readNullTermString(buf, offset, length).trim();
  if (!str) {
    return 0;
  }
  const parsed = parseInt(str, 8);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new AgentDocsError(
      'ERR_ARCHIVE_SECURITY',
      `Invalid octal header value '${str}' in snapshot archive.`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  return parsed;
}

function parsePaxRecords(buf: Buffer): Record<string, string> {
  const records: Record<string, string> = {};
  let idx = 0;
  while (idx < buf.length) {
    const spaceIdx = buf.indexOf(0x20, idx);
    if (spaceIdx === -1) {
      break;
    }
    const len = parseInt(buf.subarray(idx, spaceIdx).toString('ascii'), 10);
    if (!Number.isFinite(len) || len <= 0 || idx + len > buf.length) {
      break;
    }
    const recordEnd = buf[idx + len - 1] === 0x0a ? idx + len - 1 : idx + len;
    const record = buf.subarray(spaceIdx + 1, recordEnd).toString('utf8');
    const eqIdx = record.indexOf('=');
    if (eqIdx !== -1) {
      records[record.slice(0, eqIdx)] = record.slice(eqIdx + 1);
    }
    idx += len;
  }
  return records;
}

export function validateSafeRelativePath(relPath: string): string {
  if (!relPath || relPath.includes('\0')) {
    throw new AgentDocsError(
      'ERR_ARCHIVE_SECURITY',
      `Invalid empty or null-containing archive path: ${JSON.stringify(relPath)}`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const posix = relPath.replace(/\\/g, '/');
  if (posix.startsWith('/') || /^[a-zA-Z]:/.test(posix)) {
    throw new AgentDocsError(
      'ERR_ARCHIVE_SECURITY',
      `Refusing absolute path in snapshot archive: ${relPath}`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  const segments = posix.split('/').filter(Boolean);
  if (segments.length === 0 || segments.some(seg => seg === '.' || seg === '..')) {
    throw new AgentDocsError(
      'ERR_ARCHIVE_SECURITY',
      `Refusing path traversal segment in snapshot archive: ${relPath}`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }
  return segments.join('/');
}

export interface UnpackOptions {
  maxUncompressedBytes?: number;
  maxFiles?: number;
}

/**
 * Security-hardened `.tar.gz` unpacker for cached snapshot slices.
 * Rejects symlinks, hardlinks, device nodes, absolute/traversal paths, and zip/tar bombs.
 */
export function unpackTarGzBufferToDir(
  gzBuffer: Buffer,
  destDir: string,
  options: UnpackOptions = {}
): string[] {
  const maxBytes = options.maxUncompressedBytes ?? DEFAULT_MAX_UNCOMPRESSED_BYTES;
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;

  let tarBuf: Buffer;
  try {
    tarBuf = zlib.gunzipSync(gzBuffer, {maxOutputLength: maxBytes});
  } catch (err) {
    throw new AgentDocsError(
      'ERR_ARCHIVE_SECURITY',
      `Failed to decompress snapshot archive (exceeded ${maxBytes} bytes or corrupt gzip): ${err instanceof Error ? err.message : String(err)}`,
      EXIT_CODES.INTEGRITY_OR_SCHEMA
    );
  }

  fs.mkdirSync(destDir, {recursive: true});
  const resolvedDestRoot = fs.realpathSync(destDir);

  let offset = 0;
  let totalWritten = 0;
  let fileCount = 0;
  let pendingPaxPath: string | null = null;
  const writtenFiles: string[] = [];

  while (offset + BLOCK_SIZE <= tarBuf.length) {
    const header = tarBuf.subarray(offset, offset + BLOCK_SIZE);
    offset += BLOCK_SIZE;

    let allZero = true;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      if (header[i] !== 0) {
        allZero = false;
        break;
      }
    }
    if (allZero) {
      continue;
    }

    const expectedChecksum = parseOctal(header, 148, 8);
    let unsignedSum = 0;
    let signedSum = 0;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      const b = i >= 148 && i < 156 ? 32 : header[i];
      unsignedSum += b;
      signedSum += b > 127 ? b - 256 : b;
    }
    if (expectedChecksum !== unsignedSum && expectedChecksum !== signedSum) {
      throw new AgentDocsError(
        'ERR_ARCHIVE_SECURITY',
        `Tar header checksum mismatch at offset ${offset - BLOCK_SIZE}.`,
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }

    const typeflag = header[156] === 0 ? '0' : String.fromCharCode(header[156]);
    const size = parseOctal(header, 124, 12);
    if (offset + size > tarBuf.length) {
      throw new AgentDocsError(
        'ERR_ARCHIVE_SECURITY',
        'Truncated tar entry payload.',
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }
    const payload = tarBuf.subarray(offset, offset + size);
    const paddedSize = Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
    offset += paddedSize;

    if (typeflag === 'x') {
      const pax = parsePaxRecords(payload);
      if (pax.path) {
        pendingPaxPath = pax.path;
      }
      continue;
    }
    if (typeflag === 'g') {
      continue;
    }

    const namePart = readNullTermString(header, 0, 100);
    const prefixPart = readNullTermString(header, 345, 155);
    const rawPath = pendingPaxPath ?? (prefixPart ? `${prefixPart}/${namePart}` : namePart);
    pendingPaxPath = null;

    if (typeflag === '5') {
      validateSafeRelativePath(rawPath.replace(/\/+$/, ''));
      continue;
    }

    if (typeflag !== '0') {
      throw new AgentDocsError(
        'ERR_ARCHIVE_SECURITY',
        `Disallowed tar entry typeflag '${typeflag}' for '${rawPath}' (symlinks, hardlinks, and special files are prohibited).`,
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }

    fileCount++;
    if (fileCount > maxFiles) {
      throw new AgentDocsError(
        'ERR_ARCHIVE_SECURITY',
        `Archive exceeds maximum file count (${maxFiles}).`,
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }
    totalWritten += size;
    if (totalWritten > maxBytes) {
      throw new AgentDocsError(
        'ERR_ARCHIVE_SECURITY',
        `Archive exceeds maximum uncompressed size (${maxBytes} bytes).`,
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }

    const safeRel = validateSafeRelativePath(rawPath);
    const targetPath = path.resolve(resolvedDestRoot, safeRel);
    const relCheck = path.relative(resolvedDestRoot, targetPath);
    if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) {
      throw new AgentDocsError(
        'ERR_ARCHIVE_SECURITY',
        `Archive entry escaped destination directory: ${rawPath}`,
        EXIT_CODES.INTEGRITY_OR_SCHEMA
      );
    }

    fs.mkdirSync(path.dirname(targetPath), {recursive: true});
    fs.writeFileSync(targetPath, payload);
    writtenFiles.push(safeRel);
  }

  return writtenFiles;
}
