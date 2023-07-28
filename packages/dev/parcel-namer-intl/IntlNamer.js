/*
 * Copyright 2023 Adobe. All rights reserved.
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
  name({bundle}) {
    // Name intl bundles with locale in the filename.
    if (!bundle.needsStableName && bundle.type === 'js' && bundle.bundleBehavior !== 'inline') {
      let mainAsset = bundle.getMainEntry();
      return path.basename(mainAsset.filePath, path.extname(mainAsset.filePath)) + '.' + bundle.target.name + '.js';
    }
    return null;
  }
});
