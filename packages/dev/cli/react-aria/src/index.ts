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

import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import {runAgentDocsCli} from '../../../agent-docs-core/src/cliRunner.js';

function readOwnVersion(): string {
  try {
    const pkgUrl = new URL('../../../../package.json', import.meta.url);
    const parsed = JSON.parse(fs.readFileSync(fileURLToPath(pkgUrl), 'utf8'));
    return parsed.version || '0.1.0';
  } catch {
    return '0.1.0';
  }
}

const exitCode = await runAgentDocsCli('rac', readOwnVersion());
process.exitCode = exitCode;
