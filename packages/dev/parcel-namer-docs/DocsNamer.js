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

const mappings = {
  TooltipTrigger: 'Tooltip',
  ModalOverlay: 'Modal',
  TabList: 'Tabs',
  Dialog: 'Modal'
};

module.exports = new Namer({
  name({bundle, bundleGraph, options}) {
    if (!process.env.DOCS_ENV) {
      return null;
    }

    let main = bundle.getMainEntry();
    if (main && main.meta.isMDX) {
      // A docs page. Generate the correct URL for it based on its location.
      // Get relative path to entry file from the project root (will be e.g. `packages/@react-spectrum/button/docs/Button.mdx`)
      let entryFilePath = path.relative(options.projectRoot, main.filePath);
      let parts = entryFilePath.split(path.sep);

      let basename = path.basename(entryFilePath, path.extname(entryFilePath)) + '.html';

      // For dev files, simply /PageName.html or /dir/PageName.html
      if (parts[1] === 'dev') {
        let devPath = parts.slice(4, -1);
        // move /releases to v3/releases
        if (devPath[0] === 'releases') {
          return path.join('v3', ...devPath, basename);
        }

        // move /react-spectrum to v3 (aka getting started, etc)
        if (devPath[0] === 'react-spectrum') {
          return path.join('v3', ...devPath.slice(1), basename);
        }

        // move /react-aria and /react-stately to top-level
        if (devPath[0] === 'react-aria' || devPath[0] === 'react-stately') {
          return path.join(...devPath.slice(1), basename);
        }

        return path.join(...devPath, basename);
      }

      // // For @internationalized, group by package name.
      if (parts[1] === '@internationalized') {
        return path.join(
          parts[1].replace(/^@/, ''),
          parts[2],
          ...parts.slice(4, -1),
          basename
        );
      }

      if (parts[1] === 'react-aria-components') {
        // check if a redirect exists for this react-aria-components page
        // handle both top-level files and subdirectories like examples/
        let subPath = parts.slice(3, -1);
        return path.join('react-aria', ...subPath, basename);
      }

      // move @react-spectrum pages under /v3 aka components and stuff
      let namespace = parts[1].replace(/^@/, '');
      if (namespace === 'react-spectrum') {
        namespace = 'v3';
      }

      if (namespace === 'react-aria') {
        if (/use(Clipboard|Collator|.*Formatter|Drag.*|Drop.*|Field|Filter|Focus.*|Hover|Id|IsSSR|Keyboard|Label|Landmark|Locale|.*Press|Move|ObjectRef)\.html$/.test(basename)) {
          return path.join(...parts.slice(4, -1), basename);
        }

        if (/use(.+?)\.html$/.test(basename)) {
          return path.join(...parts.slice(4, -1), basename.replace(/use(.*?)\.html$/, (_, name) => `${mappings[name] || name}/use${name}.html`));
        }

        return path.join(...parts.slice(4, -1), basename);
      }

      if (namespace === 'react-stately') {
        if (/use(MultipleSelection|List|SingleSelectList|Drag.*|Drop.*|Overlay.*|Toggle)State\.html$/.test(basename)) {
          return path.join(...parts.slice(4, -1), basename);
        }

        if (basename.endsWith('useTabListState.html')) {
          return path.join(...parts.slice(4, -1), 'Tabs/useTabListState.html');
        }

        if (/use(.+?)(Trigger)?State\.html$/.test(basename)) {
          return path.join(...parts.slice(4, -1), basename.replace(/use(.*?)(Trigger)?State\.html$/, '$1/use$1$2State.html'));
        }

        return path.join(...parts.slice(4, -1), basename);
      }

      return path.join(
        namespace,
        ...parts.slice(4, -1),
        basename
      );
    } else if (!bundle.target || !bundle.target.distEntry) {
      // An asset. Should end up hashed in the root.
      let bundleGroup = bundleGraph.getBundleGroupsContainingBundle(bundle)[0];
      let bundleGroupBundles = bundleGraph.getBundlesInBundleGroup(bundleGroup);
      let mainBundle =  bundleGroupBundles.find(b => b.getEntryAssets().some(a => a.id === bundleGroup.entryAssetId));
      if (!mainBundle) {
        return null;
      }
      let entry = mainBundle.getEntryAssets().find(a => a.id === bundleGroup.entryAssetId).filePath;
      return path.basename(entry, path.extname(entry)) + '.' + bundle.hashReference + '.' + bundle.type;
    } else {
      // Let the default namer handle it.
      return null;
    }
  }
});
