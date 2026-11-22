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

import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {
  generateSnapshotFromTarget,
  sha256Hex,
  updateSnapshotsIndex
} from './lib/snapshotExtractor.mjs';
import os from 'node:os';
import {parseArgs} from 'node:util';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const DEFAULT_OUT_ROOT = path.join(REPO_ROOT, 'packages/dev/s2-docs/dist/snapshots');

function git(args, cwd = REPO_ROOT) {
  return execFileSync('git', ['--no-pager', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
}

export async function extractGitRefSnapshot({
  gitRef,
  outRoot,
  docRevision = 1,
  libraries,
  filterSlugs = null,
  markAsLatest = false,
  repoRoot = REPO_ROOT
}) {
  let extractorCommit = git(['rev-parse', '--short=12', 'HEAD'], repoRoot);
  if (!gitRef || gitRef === 'HEAD') {
    let sourceCommit = git(['rev-parse', '--short=12', 'HEAD'], repoRoot);
    let sourceDate = git(['show', '-s', '--format=%cI', 'HEAD'], repoRoot);
    let dateStr = sourceDate.slice(0, 10).replace(/-/g, '');
    let snapshotId = `${dateStr}-g${sourceCommit}-d${docRevision}`;
    let res = await generateSnapshotFromTarget({
      targetRoot: repoRoot,
      repoRoot,
      outRoot,
      snapshotId,
      docRevision,
      sourceTag: null,
      sourceCommit,
      sourceDate,
      extractorCommit,
      libraries,
      filterSlugs
    });
    updateSnapshotsIndex(outRoot, [res], {markAsLatest});
    return res;
  }

  let sourceCommit = git(['rev-parse', '--short=12', `${gitRef}^{commit}`], repoRoot);
  let commitDateIso = git(['show', '-s', '--format=%cI', `${gitRef}^{commit}`], repoRoot);
  let dateStr = commitDateIso.slice(0, 10).replace(/-/g, '');
  let safeTagSlug = gitRef.replace(/^@/, '').replace(/[/@]/g, '-');
  let snapshotId = `${dateStr}-${safeTagSlug}-g${sourceCommit}-d${docRevision}`;

  let tmpWorktree = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-doc-snapshot-'));
  try {
    git(['worktree', 'add', '--detach', '--quiet', tmpWorktree, gitRef], repoRoot);
    let res = await generateSnapshotFromTarget({
      targetRoot: tmpWorktree,
      repoRoot,
      outRoot,
      snapshotId,
      docRevision,
      sourceTag: gitRef,
      sourceCommit,
      sourceDate: commitDateIso,
      extractorCommit,
      libraries,
      filterSlugs
    });
    updateSnapshotsIndex(outRoot, [res], {markAsLatest});
    return res;
  } finally {
    try {
      git(['worktree', 'remove', '--force', tmpWorktree], repoRoot);
    } catch {
      fs.rmSync(tmpWorktree, {recursive: true, force: true});
      try {
        git(['worktree', 'prune'], repoRoot);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Explicitly verifies whether a patch tag (`patchRef`) has identical exported TypeScript API
 * surface for `packageName` compared to `baseVersion` before recording it in
 * `verifiedEquivalentPatches`.
 */
export async function verifyAndRecordEquivalentPatch({
  outRoot,
  packageName,
  baseVersion,
  patchVersion,
  baseRef,
  patchRef,
  baseExtraction = null,
  libraries = null,
  commitPatchOnDiff = false,
  repoRoot = REPO_ROOT
}) {
  let pkgSubdir =
    packageName === '@react-spectrum/s2'
      ? 'packages/@react-spectrum/s2'
      : `packages/${packageName}`;
  let diffPaths = [`${pkgSubdir}/exports`, `${pkgSubdir}/src`];
  let diffOut = git(['diff', '--name-only', baseRef, patchRef, '--', ...diffPaths], repoRoot);

  // Compare API and documentation while ignoring the package version stamped into generated prose.
  let tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-patch-verify-'));
  try {
    let extractLibraries = libraries || [packageName === '@react-spectrum/s2' ? 's2' : 'rac'];
    let baseRes =
      baseExtraction ||
      (await extractGitRefSnapshot({
        gitRef: baseRef,
        outRoot: path.join(tmpDir, 'base'),
        libraries: extractLibraries,
        repoRoot
      }));
    let patchTmpRoot = path.join(tmpDir, 'patch');
    let patchRes = await extractGitRefSnapshot({
      gitRef: patchRef,
      outRoot: patchTmpRoot,
      libraries: extractLibraries,
      repoRoot
    });

    const computeDocumentationDigest = res => {
      let normalizedEntries = (res.entries || [])
        .filter(parsed => parsed.packageName === packageName)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(parsed => ({
          id: parsed.id,
          title: parsed.title,
          summary: parsed.summary,
          imports: parsed.imports,
          compositionRules: parsed.compositionRules,
          sections: parsed.sections,
          exports: parsed.exports
        }));
      const version = res.manifest?.packages?.[packageName];
      if (!version || normalizedEntries.length === 0) {
        throw new Error(
          `No documentation was extracted for ${packageName} in snapshot '${res.manifest?.snapshotId}'.`
        );
      }
      let normalizedAssets = null;
      if (packageName === '@react-spectrum/s2' && res.s2Assets) {
        let rawAssets = {...res.s2Assets};
        delete rawAssets.packageVersion;
        normalizedAssets = rawAssets;
      }
      return sha256Hex(
        JSON.stringify({entries: normalizedEntries, assets: normalizedAssets})
          .split(`${packageName}@${version}`)
          .join(packageName)
      );
    };

    let baseDigest = computeDocumentationDigest(baseRes);
    let patchDigest = computeDocumentationDigest(patchRes);
    let equivalent = baseDigest === patchDigest;
    let dedicatedSnapshotId = null;

    if (equivalent) {
      let indexPath = path.join(outRoot, 'index.json');
      let indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      let pkgRecord = indexData.packages?.[packageName]?.[baseVersion];
      if (!pkgRecord) {
        throw new Error(`Missing baseline snapshot for ${packageName}@${baseVersion}.`);
      }
      let set = new Set(pkgRecord.verifiedEquivalentPatches || []);
      set.add(patchVersion);
      pkgRecord.verifiedEquivalentPatches = [...set].sort();
      fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2) + '\n', 'utf8');
    } else if (commitPatchOnDiff) {
      let patchSnapId = patchRes.manifest.snapshotId;
      let srcSnapDir = path.join(patchTmpRoot, 'by-id', patchSnapId);
      let destSnapDir = path.join(outRoot, 'by-id', patchSnapId);
      fs.mkdirSync(path.dirname(destSnapDir), {recursive: true});
      fs.rmSync(destSnapDir, {recursive: true, force: true});
      fs.cpSync(srcSnapDir, destSnapDir, {recursive: true});
      updateSnapshotsIndex(outRoot, [patchRes]);
      dedicatedSnapshotId = patchSnapId;
    }

    return {
      packageName,
      baseVersion,
      patchVersion,
      equivalent,
      dedicatedSnapshotId,
      changedSourceFiles: diffOut ? diffOut.split('\n').filter(Boolean) : []
    };
  } finally {
    fs.rmSync(tmpDir, {recursive: true, force: true});
  }
}

async function main() {
  let {values} = parseArgs({
    options: {
      out: {type: 'string'},
      tag: {type: 'string'},
      'doc-revision': {type: 'string'},
      libraries: {type: 'string'},
      'filter-slugs': {type: 'string'},
      prototype: {type: 'boolean', default: false}
    },
    allowPositionals: true
  });

  let outRoot = values.out ? path.resolve(values.out) : DEFAULT_OUT_ROOT;
  let docRevision = values['doc-revision'] ? Number.parseInt(values['doc-revision'], 10) : 1;
  let libraries = values.libraries
    ? values.libraries
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : ['s2', 'rac', 'internationalized'];
  let filterSlugs = values['filter-slugs']
    ? values['filter-slugs']
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : null;

  if (values.prototype) {
    console.log('[1/3] Extracting current HEAD snapshot...');
    let headRes = await extractGitRefSnapshot({
      gitRef: 'HEAD',
      outRoot,
      docRevision,
      libraries,
      filterSlugs,
      markAsLatest: true
    });
    console.log(
      `  -> ${headRes.manifest.snapshotId} (${headRes.entryCount} entries, packages: ${JSON.stringify(headRes.manifest.packages)})`
    );

    console.log(
      '[2/3] Extracting historical @react-spectrum/s2@1.2.0 snapshot via detached git worktree...'
    );
    let s2OldRes = await extractGitRefSnapshot({
      gitRef: '@react-spectrum/s2@1.2.0',
      outRoot,
      docRevision,
      libraries: ['s2'],
      filterSlugs,
      markAsLatest: false
    });
    console.log(
      `  -> ${s2OldRes.manifest.snapshotId} (${s2OldRes.entryCount} entries, layout: ${JSON.stringify(s2OldRes.manifest.docsLayouts)})`
    );

    console.log(
      '[3/3] Extracting historical pre-s2-docs react-aria-components@1.4.0 snapshot via detached git worktree...'
    );
    let racOldRes = await extractGitRefSnapshot({
      gitRef: 'react-aria-components@1.4.0',
      outRoot,
      docRevision,
      libraries: ['rac'],
      filterSlugs,
      markAsLatest: false
    });
    console.log(
      `  -> ${racOldRes.manifest.snapshotId} (${racOldRes.entryCount} entries, layout: ${JSON.stringify(racOldRes.manifest.docsLayouts)})`
    );
    return;
  }

  let ref = values.tag || 'HEAD';
  let res = await extractGitRefSnapshot({
    gitRef: ref,
    outRoot,
    docRevision,
    libraries,
    filterSlugs,
    markAsLatest: ref === 'HEAD'
  });
  console.log(
    `Generated snapshot ${res.manifest.snapshotId} (${res.entryCount} entries) -> ${outRoot}`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
