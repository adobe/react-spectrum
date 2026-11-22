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
 * Selective historical snapshot backfill runner for `@react-spectrum/s2@1.x` and
 * `react-aria-components@1.x`.
 *
 * - Extracts full per-package snapshots for baseline minor releases (`1.x.0`).
 * - Verifies patch tags (`1.x.1`, `1.x.2`, ...) against their minor baseline using
 *   `verifyAndRecordEquivalentPatch`:
 *
 *   - Surface-identical patches are recorded in `verifiedEquivalentPatches` without duplicating
 *     `.tar.gz` slices.
 *   - Patches that altered exported TypeScript props/events/types or docs extract their own dedicated
 *     patch snapshot so patch coverage is never falsely advertised.
 */

import {execFileSync} from 'node:child_process';
import {extractGitRefSnapshot, verifyAndRecordEquivalentPatch} from './generateDocSnapshots.mjs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');

const SUPPORTED_BACKFILL_PACKAGES = {
  '@react-spectrum/s2': {
    libraries: ['s2', 'internationalized'],
    minMajor: 1
  },
  'react-aria-components': {
    libraries: ['rac', 'internationalized'],
    minMajor: 1
  }
};

function parsePkgTag(tag) {
  let atIdx = tag.lastIndexOf('@');
  if (atIdx <= 0) {
    return null;
  }
  let packageName = tag.slice(0, atIdx);
  let version = tag.slice(atIdx + 1);
  let m = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!m) {
    return null;
  }
  return {
    tag,
    packageName,
    version,
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    prerelease: m[4] || null
  };
}

export function discoverBackfillPlan({
  repoRoot = REPO_ROOT,
  packageFilter = null,
  explicitTags = null,
  includePrereleases = false,
  limitMinors = null
} = {}) {
  let rawTags = explicitTags
    ? explicitTags
    : execFileSync('git', ['tag', '--list'], {cwd: repoRoot, encoding: 'utf8'})
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean);

  let parsed = [];
  for (let tag of rawTags) {
    let info = parsePkgTag(tag);
    if (!info) {
      continue;
    }
    let cfg = SUPPORTED_BACKFILL_PACKAGES[info.packageName];
    if (!cfg) {
      continue;
    }
    if (packageFilter && info.packageName !== packageFilter) {
      continue;
    }
    if (info.major < cfg.minMajor) {
      continue;
    }
    if (info.prerelease && !includePrereleases) {
      continue;
    }
    parsed.push(info);
  }

  parsed.sort(
    (a, b) =>
      a.packageName.localeCompare(b.packageName) ||
      a.major - b.major ||
      a.minor - b.minor ||
      a.patch - b.patch
  );

  // Group into minor series (`<pkg>@<major>.<minor>`)
  let groups = new Map();
  for (let item of parsed) {
    let key = `${item.packageName}@${item.major}.${item.minor}`;
    if (!groups.has(key)) {
      groups.set(key, {
        seriesKey: key,
        packageName: item.packageName,
        libraries: SUPPORTED_BACKFILL_PACKAGES[item.packageName].libraries,
        baseline: item,
        patches: []
      });
    } else {
      groups.get(key).patches.push(item);
    }
  }

  let seriesList = Array.from(groups.values());
  if (limitMinors && limitMinors > 0) {
    // Keep the most recent N minor series per package
    let byPkg = new Map();
    for (let s of seriesList) {
      if (!byPkg.has(s.packageName)) {
        byPkg.set(s.packageName, []);
      }
      byPkg.get(s.packageName).push(s);
    }
    seriesList = [];
    for (let list of byPkg.values()) {
      seriesList.push(...list.slice(-limitMinors));
    }
  }

  return seriesList;
}

export async function runBackfill({
  outRoot,
  packageFilter = null,
  explicitTags = null,
  verifyPatches = true,
  limitMinors = null,
  dryRun = false,
  repoRoot = REPO_ROOT
}) {
  let plan = discoverBackfillPlan({
    repoRoot,
    packageFilter,
    explicitTags,
    limitMinors
  });

  if (dryRun) {
    return {dryRun: true, plan};
  }

  let extractedSnapshots = [];
  let verifiedPatches = [];
  let dedicatedPatchSnapshots = [];

  for (let series of plan) {
    let baseSummary = await extractGitRefSnapshot({
      gitRef: series.baseline.tag,
      outRoot,
      libraries: series.libraries,
      repoRoot
    });
    extractedSnapshots.push({
      tag: series.baseline.tag,
      snapshotId: baseSummary.manifest.snapshotId
    });

    if (!verifyPatches) {
      continue;
    }

    for (let patchInfo of series.patches) {
      let check = await verifyAndRecordEquivalentPatch({
        outRoot,
        packageName: series.packageName,
        baseVersion: series.baseline.version,
        patchVersion: patchInfo.version,
        baseRef: series.baseline.tag,
        patchRef: patchInfo.tag,
        baseExtraction: baseSummary,
        libraries: series.libraries,
        commitPatchOnDiff: true,
        repoRoot
      });

      if (check.equivalent) {
        verifiedPatches.push({
          tag: patchInfo.tag,
          equivalentTo: series.baseline.version
        });
      } else {
        // Patch changed public API, docs, or assets -> reuse already-extracted dedicated snapshot
        dedicatedPatchSnapshots.push({
          tag: patchInfo.tag,
          snapshotId: check.dedicatedSnapshotId
        });
      }
    }
  }

  return {
    dryRun: false,
    extractedSnapshots,
    verifiedPatches,
    dedicatedPatchSnapshots
  };
}

async function main() {
  const {values} = parseArgs({
    options: {
      out: {type: 'string'},
      package: {type: 'string'},
      tag: {type: 'string', multiple: true},
      'limit-minors': {type: 'string'},
      'skip-patch-verify': {type: 'boolean'},
      'dry-run': {type: 'boolean'},
      help: {type: 'boolean', short: 'h'}
    }
  });

  if (values.help) {
    console.log(
      [
        'Usage: node packages/dev/s2-docs/scripts/backfillSnapshots.mjs [options]',
        '',
        'Options:',
        '  --out <dir>              Output snapshot directory (default: packages/dev/s2-docs/dist/snapshots)',
        '  --package <name>         Filter to @react-spectrum/s2 or react-aria-components',
        '  --tag <git-tag>          Explicit git tag(s) to backfill (repeatable)',
        '  --limit-minors <N>       Limit to the latest N minor series per package',
        '  --skip-patch-verify      Only extract minor baselines without verifying patches',
        '  --dry-run                Print discovered minor baselines & patch tags without extracting'
      ].join('\n')
    );
    return;
  }

  const outRoot = path.resolve(
    values.out || path.join(REPO_ROOT, 'packages/dev/s2-docs/dist/snapshots')
  );
  const res = await runBackfill({
    outRoot,
    packageFilter: values.package || null,
    explicitTags: values.tag?.length ? values.tag : null,
    verifyPatches: !values['skip-patch-verify'],
    limitMinors: values['limit-minors'] ? Number(values['limit-minors']) : null,
    dryRun: Boolean(values['dry-run'])
  });

  if (res.dryRun) {
    console.log(`Discovered ${res.plan.length} minor series for backfill:`);
    for (let s of res.plan) {
      console.log(
        `  - ${s.baseline.tag} (${s.patches.length} patch release(s): ${s.patches.map(p => p.version).join(', ') || 'none'})`
      );
    }
    return;
  }

  console.log(
    `Backfill complete: ${res.extractedSnapshots.length} baseline snapshot(s), ${res.verifiedPatches.length} verified-equivalent patch(es), ${res.dedicatedPatchSnapshots.length} dedicated patch snapshot(s).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
