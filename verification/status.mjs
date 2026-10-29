/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed
 * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import {coveredFiles, discoverPackages, packageNamePattern, readPackage} from './metadata.mjs';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {isAbsolute, join, relative, resolve, sep} from 'node:path';
import {readdirSync, readFileSync} from 'node:fs';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));

function fingerprint(path) {
  try {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function readReview(root, name) {
  let review = JSON.parse(readFileSync(join(root, 'verification', name, 'review.json'), 'utf8'));
  if (
    review.schemaVersion !== 1 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt) ||
    !/^[a-f0-9]{40}$/.test(review.reviewedCommit) ||
    typeof review.note !== 'string' ||
    !review.note.trim()
  ) {
    throw new Error('Invalid review metadata; expected schemaVersion 1, date, commit, and note.');
  }

  let paths = new Set();
  for (let group of ['sourceFiles', 'verificationFiles']) {
    let files = review[group];
    if (!files || typeof files !== 'object' || Array.isArray(files) || !Object.keys(files).length) {
      throw new Error(`Review metadata must contain a nonempty ${group} map.`);
    }
    for (let [path, hash] of Object.entries(files)) {
      let localPath = relative(root, resolve(root, path));
      if (
        !path ||
        isAbsolute(path) ||
        path.includes('\\') ||
        path.split('/').some(part => !part || part === '.' || part === '..') ||
        localPath.startsWith(`..${sep}`) ||
        localPath === '..' ||
        paths.has(path) ||
        !/^[a-f0-9]{64}$/.test(hash)
      ) {
        throw new Error(`Invalid or duplicate file entry: ${path}`);
      }
      paths.add(path);
    }
  }
  return review;
}

export function inspectPackage(root, name) {
  if (!packageNamePattern.test(name)) {
    return {name, status: 'error', error: 'Invalid package name.'};
  }
  let directory;
  try {
    directory = readdirSync(join(root, 'verification', name));
  } catch (error) {
    return {name, status: 'error', error: `Cannot read package: ${error.message}`};
  }
  try {
    let metadata = directory.includes('verification.json') ? readPackage(root, name) : null;
    if (!directory.includes('review.json')) {
      return {name, status: 'not-recorded', changes: []};
    }
    let review = readReview(root, name);
    let changes = [];
    for (let group of ['sourceFiles', 'verificationFiles']) {
      for (let [path, expected] of Object.entries(review[group])) {
        let actual = fingerprint(resolve(root, path));
        if (actual !== expected) {
          changes.push({
            group,
            path,
            status: actual === null ? 'missing' : 'changed',
            expected,
            actual
          });
        }
      }
    }
    for (let [group, files] of Object.entries(metadata ? coveredFiles(metadata) : {})) {
      for (let path of files) {
        if (!(path in review[group])) {
          changes.push({
            group,
            path,
            status: 'unrecorded',
            expected: null,
            actual: fingerprint(resolve(root, path))
          });
        }
      }
    }
    return {
      name,
      status: changes.length ? 'needs-review' : 'matches-record',
      reviewedAt: review.reviewedAt,
      reviewedCommit: review.reviewedCommit,
      note: review.note,
      changes
    };
  } catch (error) {
    return {name, status: 'error', error: error.message};
  }
}

export function runStatus(args, root = repositoryRoot, write = console.log) {
  if (args.includes('--help')) {
    write(
      'Usage: node verification/status.mjs [package] [--json]\nExit codes: 0 matches record, 1 review needed or not recorded, 2 invalid input/metadata.'
    );
    return 0;
  }
  let names = args.filter(arg => arg !== '--json');
  if (names.length > 1 || names.some(name => !packageNamePattern.test(name))) {
    write('Usage: node verification/status.mjs [package] [--json]');
    return 2;
  }
  let packages;
  try {
    if (!names.length) {
      names = discoverPackages(root);
    }
    packages = names.map(name => inspectPackage(root, name));
  } catch (error) {
    write(`Cannot discover verification packages: ${error.message}`);
    return 2;
  }
  let result = {verification: 'not-run', packages};
  if (args.includes('--json')) {
    write(JSON.stringify(result, null, 2));
  } else {
    for (let item of packages) {
      write(`${item.name}: ${item.status.toUpperCase().replaceAll('-', ' ')}`);
      if (item.reviewedCommit)
        write(`  Recorded review: ${item.reviewedAt} (${item.reviewedCommit})`);
      if (item.error) write(`  ${item.error}`);
      for (let change of item.changes || []) {
        write(
          `  ${change.group === 'sourceFiles' ? 'Source' : 'Verification'} ${change.status}: ${change.path}`
        );
      }
      if (item.status === 'not-recorded')
        write('  Add review.json after reviewing source correspondence.');
    }
    if (!packages.length) write('No verification packages found.');
    write('Verification results: not run. Matching hashes do not establish correctness.');
  }
  return packages.some(item => item.status === 'error')
    ? 2
    : packages.some(item => item.status !== 'matches-record')
      ? 1
      : 0;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = runStatus(process.argv.slice(2));
}
