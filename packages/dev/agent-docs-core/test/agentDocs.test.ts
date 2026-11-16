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

import path from 'path';
import {spawnSync} from 'child_process';

jest.setTimeout(60000);

describe('agent-docs version-aware SDK, CLIs, MCP v2, publisher, and plugins', () => {
  it('passes all ESM unit and integration suites', () => {
    const testDir = __dirname;
    const files = [
      path.join(testDir, 'resolverAndLockfiles.test.mjs'),
      path.join(testDir, 'cacheAndPublishSecurity.test.mjs'),
      path.join(testDir, 'cliMcpAndPlugins.test.mjs')
    ];
    const result = spawnSync(process.execPath, ['--test', ...files], {
      cwd: path.resolve(__dirname, '../../../..'),
      encoding: 'utf8'
    });
    if (result.status !== 0) {
      throw new Error(
        `node --test failed (exit ${result.status}):\n${result.stdout}\n${result.stderr}`
      );
    }
    expect(result.status).toBe(0);
  });
});
