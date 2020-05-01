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

const {Namer} = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
  name({bundle, bundleGraph, options}) {
    if (!bundle.isEntry || bundle.type !== 'html') {
      // let default namer handle it
      return null;
    }

    // Get relative path to entry file from the project root (will be e.g. `packages/@react-spectrum/button/docs/Button.mdx`)
    let entryFilePath = path.relative(options.projectRoot, bundle.getMainEntry().filePath);
    let parts = entryFilePath.split(path.sep);

    let basename = path.basename(entryFilePath, path.extname(entryFilePath)) + '.html';

    // For dev files, simply /PageName.html or /dir/PageName.html
    if (parts[1] === 'dev') {
      return path.join(...parts.slice(4, -1), basename);
    }

    // For @namespace package files, urls will be /${namespace}/PageName.html
    return path.join(
      parts[1].replace(/^@/, ''),
      ...parts.slice(4, -1),
      basename
    );
  }
});
