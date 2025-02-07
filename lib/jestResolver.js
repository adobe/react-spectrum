/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {compileStrings} = require('@internationalized/string-compiler');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const {threadId} = require('worker_threads');
const glob = require('glob');

const intlCacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'intl');
const globCacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'glob');
try {
  fs.mkdirSync(intlCacheDir, {recursive: true});
  fs.mkdirSync(globCacheDir, {recursive: true});
} catch (err) {
  // ignore
}

module.exports = (request, options) => {
  // Handle glob imports.
  if (request.endsWith('*.json')) {
    let files = glob.sync(request, {cwd: options.basedir});
    let source = '';
    for (let file of files) {
      source += `exports['${path.basename(file, '.json')}'] = require('${path.join(options.basedir, file)}');\n`;
    }
    let hash = crypto.createHash('md5');
    hash.update(source);
    let cacheFile = path.join(globCacheDir, hash.digest('hex'));
    return writeCacheFile(cacheFile, source);
  }

  let resolved = options.defaultResolver(request, {
    ...options,
    // https://github.com/microsoft/accessibility-insights-web/pull/5421#issuecomment-1109168149
    packageFilter: pkg => {
      if (!pkg.name?.startsWith('@tailwind') && pkg.name !== 'tailwindcss') {
        delete pkg['exports'];
        delete pkg['module'];
      }
      return pkg;
    }
  });
  if (/packages\/.*\/.*\/intl\/.*\.json$/.test(resolved)) {
    let sourceText = fs.readFileSync(resolved, 'utf8');
    let json = JSON.parse(sourceText);
    let res = compileStrings(json);

    let hash = crypto.createHash('md5');
    hash.update(res);
    let cacheFile = path.join(intlCacheDir, hash.digest('hex') + '.js');
    return writeCacheFile(cacheFile, res);
  }

  return resolved;
};

function writeCacheFile(cacheFile, res) {
  // If cache file already exists, return it.
  if (fs.existsSync(cacheFile)) {
    return cacheFile;
  }

  // Otherwise, write it atomically to avoid race conditions between threads/processes.
  let tmpFile = cacheFile + '.' + process.pid + (threadId != null ? '.' + threadId : '');
  fs.writeFileSync(tmpFile, res);
  fs.renameSync(tmpFile, cacheFile);
  return cacheFile;
}
