/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {spawn} = require('child_process');

let args = [...process.argv.slice(2)];

// Skip v2 tests if it cannot be resolved
try {
  require.resolve('@react/react-spectrum/Button');
} catch (err) {
  console.log('Skipping v2 parity tests since it is not installed...');
  args.push('-t', '^((?!v2).)*$');
}

process.env.NODE_ICU_DATA = 'node_modules/full-icu';
let jest = spawn('jest', args, {
  stdio: 'inherit'
});

jest.on('close', (code) => {
  process.exit(code);
});
