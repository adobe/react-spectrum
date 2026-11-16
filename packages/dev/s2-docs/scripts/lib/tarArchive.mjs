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

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BLOCK_SIZE = 512;
const DEFAULT_MAX_FILES = 10000;
const DEFAULT_MAX_BYTES = 256 * 1024 * 1024;

function normalizeArchivePath(rawPath) {
  if (typeof rawPath !== 'string' || rawPath.length === 0) {
    throw new Error('Invalid archive entry path: empty path');
  }
  if (rawPath.includes('\0')) {
    throw new Error(`Invalid archive entry path containing NUL byte: ${rawPath}`);
  }
  let normalized = rawPath.replace(/\\/g, '/').replace(/^\.\//, '');
  if (normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) {
    throw new Error(`Invalid absolute archive entry path: ${rawPath}`);
  }
  let parts = normalized.split('/').filter(Boolean);
  if (parts.length === 0) {
    throw new Error(`Invalid empty archive entry path: ${rawPath}`);
  }
  for (let part of parts) {
    if (part === '.' || part === '..') {
      throw new Error(`Unsafe traversal segment in archive entry path: ${rawPath}`);
    }
  }
  return parts.join('/');
}

function writeStringField(buf, str, offset, length) {
  let bytes = Buffer.from(str, 'utf8');
  let copyLen = Math.min(bytes.length, length);
  bytes.copy(buf, offset, 0, copyLen);
}

function writeOctalField(buf, value, offset, length) {
  let str = value.toString(8).padStart(length - 1, '0');
  writeStringField(buf, str, offset, length - 1);
  buf[offset + length - 1] = 0;
}

function createUstarHeader({name, prefix = '', mode = 0o644, size, mtime = 0, typeflag = '0'}) {
  let header = Buffer.alloc(BLOCK_SIZE, 0);
  writeStringField(header, name, 0, 100);
  writeOctalField(header, mode, 100, 8);
  writeOctalField(header, 0, 108, 8);
  writeOctalField(header, 0, 116, 8);
  writeOctalField(header, size, 124, 12);
  writeOctalField(header, mtime, 136, 12);
  header.fill(0x20, 148, 156);
  header[156] = typeflag.charCodeAt(0);
  writeStringField(header, 'ustar', 257, 5);
  header[262] = 0;
  writeStringField(header, '00', 263, 2);
  if (prefix) {
    writeStringField(header, prefix, 345, 155);
  }
  let sum = 0;
  for (let i = 0; i < BLOCK_SIZE; i++) {
    sum += header[i];
  }
  let checksumOctal = sum.toString(8).padStart(6, '0');
  writeStringField(header, checksumOctal, 148, 6);
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

function formatPaxRecord(key, value) {
  let body = ` ${key}=${value}\n`;
  let len = Buffer.byteLength(body, 'utf8') + 1;
  while (true) {
    let candidate = `${len}${body}`;
    let actual = Buffer.byteLength(candidate, 'utf8');
    if (actual === len) {
      return Buffer.from(candidate, 'utf8');
    }
    len = actual;
  }
}

function padToBlock(buf) {
  let remainder = buf.length % BLOCK_SIZE;
  if (remainder === 0) {
    return buf;
  }
  return Buffer.concat([buf, Buffer.alloc(BLOCK_SIZE - remainder, 0)]);
}

/**
 * Deterministically packs in-memory files into a gzip-compressed POSIX ustar/PAX tar archive.
 *
 * @param {{path: string; content: Buffer | string}[]} entries
 * @returns {Buffer}
 */
export function packTarGz(entries) {
  let sorted = [...entries]
    .map(entry => ({
      path: normalizeArchivePath(entry.path),
      data: Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content, 'utf8')
    }))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  let chunks = [];
  for (let entry of sorted) {
    let pathBytes = Buffer.byteLength(entry.path, 'utf8');
    let name = entry.path;
    let prefix = '';

    if (pathBytes > 100) {
      let paxPayload = formatPaxRecord('path', entry.path);
      let paxHeader = createUstarHeader({
        name: `PaxHeader/${path.posix.basename(entry.path).slice(0, 80)}`,
        mode: 0o644,
        size: paxPayload.length,
        mtime: 0,
        typeflag: 'x'
      });
      chunks.push(paxHeader, padToBlock(paxPayload));
      name = path.posix.basename(entry.path).slice(0, 99);
    }

    let fileHeader = createUstarHeader({
      name,
      prefix,
      mode: 0o644,
      size: entry.data.length,
      mtime: 0,
      typeflag: '0'
    });
    chunks.push(fileHeader);
    if (entry.data.length > 0) {
      chunks.push(padToBlock(entry.data));
    }
  }

  chunks.push(Buffer.alloc(BLOCK_SIZE * 2, 0));
  let tarBuffer = Buffer.concat(chunks);
  return zlib.gzipSync(tarBuffer, {level: 9});
}

function readCString(buf, offset, length) {
  let end = offset + length;
  let nul = buf.indexOf(0, offset);
  if (nul !== -1 && nul < end) {
    end = nul;
  }
  return buf.subarray(offset, end).toString('utf8');
}

function readOctal(buf, offset, length) {
  let raw = readCString(buf, offset, length).trim();
  if (!raw) {
    return 0;
  }
  let parsed = Number.parseInt(raw, 8);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid tar octal field: "${raw}"`);
  }
  return parsed;
}

function parsePaxRecords(buf) {
  let records = {};
  let text = buf.toString('utf8');
  let cursor = 0;
  while (cursor < text.length) {
    let spaceIdx = text.indexOf(' ', cursor);
    if (spaceIdx === -1) {
      break;
    }
    let byteLen = Number.parseInt(text.slice(cursor, spaceIdx), 10);
    if (!Number.isFinite(byteLen) || byteLen <= 0) {
      break;
    }
    let sliceBytes = Buffer.from(text.slice(cursor), 'utf8').subarray(0, byteLen).toString('utf8');
    let eqIdx = sliceBytes.indexOf('=');
    let spIdx = sliceBytes.indexOf(' ');
    if (spIdx !== -1 && eqIdx > spIdx) {
      let key = sliceBytes.slice(spIdx + 1, eqIdx);
      let val = sliceBytes.slice(eqIdx + 1).replace(/\n$/, '');
      records[key] = val;
    }
    cursor += sliceBytes.length;
  }
  return records;
}

/**
 * Safely unpacks a `.tar.gz` buffer into `destDir`, rejecting path traversal, symlinks, and bombs.
 */
export function unpackTarGzToDir(gzBuffer, destDir, options = {}) {
  let maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  let maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  let tarBuf = zlib.gunzipSync(gzBuffer, {maxOutputLength: maxBytes + BLOCK_SIZE * 64});

  let resolvedDest = path.resolve(destDir);
  fs.mkdirSync(resolvedDest, {recursive: true});

  let offset = 0;
  let fileCount = 0;
  let totalBytes = 0;
  let pendingPax = null;

  while (offset + BLOCK_SIZE <= tarBuf.length) {
    let header = tarBuf.subarray(offset, offset + BLOCK_SIZE);
    offset += BLOCK_SIZE;

    let isZeroBlock = true;
    for (let i = 0; i < BLOCK_SIZE; i++) {
      if (header[i] !== 0) {
        isZeroBlock = false;
        break;
      }
    }
    if (isZeroBlock) {
      continue;
    }

    let name = readCString(header, 0, 100);
    let prefix = readCString(header, 345, 155);
    let size = readOctal(header, 124, 12);
    let typeByte = header[156];
    let typeflag = typeByte === 0 ? '0' : String.fromCharCode(typeByte);

    if (offset + size > tarBuf.length) {
      throw new Error('Truncated tar archive entry');
    }
    let data = tarBuf.subarray(offset, offset + size);
    offset += Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;

    if (typeflag === 'x') {
      pendingPax = parsePaxRecords(data);
      continue;
    }
    if (typeflag === 'g') {
      continue;
    }
    if (typeflag === 'L') {
      pendingPax = {...(pendingPax || {}), path: readCString(data, 0, data.length)};
      continue;
    }
    if (typeflag !== '0' && typeflag !== '5') {
      throw new Error(`Disallowed tar entry type "${typeflag}" (symlinks/links/devices rejected)`);
    }

    let fullRelPath = pendingPax?.path || (prefix ? `${prefix}/${name}` : name);
    pendingPax = null;

    let safeRelPath = normalizeArchivePath(fullRelPath);
    let targetPath = path.resolve(resolvedDest, safeRelPath);
    if (targetPath !== resolvedDest && !targetPath.startsWith(resolvedDest + path.sep)) {
      throw new Error(`Archive entry escaped destination root: ${fullRelPath}`);
    }

    if (typeflag === '5') {
      fs.mkdirSync(targetPath, {recursive: true});
      continue;
    }

    fileCount += 1;
    totalBytes += data.length;
    if (fileCount > maxFiles) {
      throw new Error(`Archive exceeded maximum file count (${maxFiles})`);
    }
    if (totalBytes > maxBytes) {
      throw new Error(`Archive exceeded maximum uncompressed byte limit (${maxBytes})`);
    }

    fs.mkdirSync(path.dirname(targetPath), {recursive: true});
    fs.writeFileSync(targetPath, data);
  }
}
