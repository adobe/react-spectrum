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
    let main = bundle.getMainEntry();
    if (main && main.meta.isMDX) {
      // A docs page. Generate the correct URL for it based on its location.
      // Get relative path to entry file from the project root (will be e.g. `packages/@react-spectrum/button/docs/Button.mdx`)
      let entryFilePath = path.relative(options.projectRoot, main.filePath);
      let parts = entryFilePath.split(path.sep);

      let basename = path.basename(entryFilePath, path.extname(entryFilePath)) + '.' + bundle.type;

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
    } else if (!bundle.target || !bundle.target.distEntry) {
      // An asset. Should end up hashed in the root.
      let bundleGroup = bundleGraph.getBundleGroupsContainingBundle(bundle)[0];
      let bundleGroupBundles = bundleGraph.getBundlesInBundleGroup(bundleGroup);
      let mainBundle =  bundleGroupBundles.find(b => b.getEntryAssets().some(a => a.id === bundleGroup.entryAssetId));
      let entry = mainBundle.getEntryAssets().find(a => a.id === bundleGroup.entryAssetId).filePath;
      return path.basename(entry, path.extname(entry)) + '.' + bundle.hashReference + '.' + bundle.type;
    } else {
      // Let the default namer handle it.
      return null;
    }
  }
});
