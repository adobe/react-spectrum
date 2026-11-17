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

import {execFileSync, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const snapshotSource = fs.mkdtempSync(path.join(os.tmpdir(), 'rsp-agent-docs-tests-'));

try {
  for (const script of ['build:cli', 'build:mcp']) {
    execFileSync('yarn', [script], {cwd: repoRoot, stdio: 'inherit'});
  }
  const {generateSnapshotFromTarget, updateSnapshotsIndex} = await import(
    new URL('../../s2-docs/scripts/lib/snapshotExtractor.mjs', import.meta.url).href
  );
  const snapshot = await generateSnapshotFromTarget({
    targetRoot: repoRoot,
    repoRoot,
    outRoot: snapshotSource,
    snapshotId: 'test-current',
    sourceCommit: 'test',
    extractorCommit: 'test',
    filterSlugs: [
      'Button',
      'ComboBox',
      's2:ActionMenu',
      'Menu',
      'rac:Select',
      'TableView',
      'Dialog',
      'Modal',
      'getting-started',
      'collections',
      'Button/useButton',
      'ListBox/useListBox',
      'internationalized/date/CalendarDate',
      'internationalized/date/DateFormatter',
      'internationalized/number/NumberFormatter',
      'useNumberFormatter',
      's2:guide/implementation-guidance',
      's2:guide/component-decision-tree'
    ]
  });
  updateSnapshotsIndex(snapshotSource, [snapshot], {markAsLatest: true});
  const files = fs.readdirSync(testDir).filter(name => name.endsWith('.test.mjs'));
  const result = spawnSync(
    process.execPath,
    ['--test', ...files.map(name => path.join(testDir, name))],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {...process.env, RSP_AGENT_DOCS_TEST_SNAPSHOT_SOURCE: snapshotSource}
    }
  );
  if (result.error) {
    throw result.error;
  }
  process.exitCode = result.status ?? 1;
} finally {
  fs.rmSync(snapshotSource, {recursive: true, force: true});
}
