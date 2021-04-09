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

// actions/rename-many.js

const path = require('path');
const util = require('util');
const fs = require('fs');
const globby = require('globby');

const renameAsync = util.promisify(fs.rename);

module.exports = async function renameMany (data, userConfig, plop) {
  // shallow-merge default config and input config
  const cfg = Object.assign({
    verbose: true
  }, userConfig);

  if (typeof cfg.renamer !== 'function') {
    throw new Error('Invalid "renamer" argument - must be a function');
  }

  if (typeof cfg.templateFiles === 'function') {
    cfg.templateFiles = cfg.templateFiles();
  }

  cfg.templateFiles = []
    .concat(cfg.templateFiles) // Ensure `cfg.templateFiles` is an array, even if a string is passed.
    .map(file => plop.renderString(file, data)); // render the paths as hbs templates

  const templateFiles = globby.sync(cfg.templateFiles, {
    nobrace: true
  });

  const filesRenamed = [];
  for (let filepath of templateFiles) {
    const oldFileName = path.basename(filepath);
    const newFileName = cfg.renamer(oldFileName);
    const directory = path.dirname(filepath);
    const newFilepath = path.resolve(directory, newFileName);
    if (typeof newFileName === 'string') {
      await renameAsync(filepath, newFilepath);
      filesRenamed.push(path.relative(process.cwd(), newFilepath));
    }
  }

  const summary = `${filesRenamed.length} files renamed`;
  if (!cfg.verbose) {
    return summary;
  } else {
    return `${summary}\n -> ${filesRenamed.join('\n -> ')}`;
  }
};
