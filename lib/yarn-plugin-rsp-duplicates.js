/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// This is a Yarn plugin to detect multiple installed versions of React Spectrum/React Aria packages.
// It can be installed by running `yarn plugin import https://raw.githubusercontent.com/adobe/react-spectrum/main/lib/yarn-plugin-rsp-duplicates.js`.
module.exports = {
  name: 'plugin-rsp-duplicates',
  factory: require => {
    const {structUtils, MessageName, ReportError} = require('@yarnpkg/core');

    return {
      default: {
        hooks: {
          afterAllInstalled(project) {
            let packages = new Map();
            let hasRSP = false;
            for (const pkg of project.storedPackages.values()) {
              if (!structUtils.isVirtualLocator(pkg) && (pkg.scope === 'react-aria' || pkg.scope === 'react-spectrum' || pkg.scope === 'react-stately')) {
                let key = `@${pkg.scope}/${pkg.name}`;
                if (!packages.has(key)) {
                  packages.set(key, new Set([pkg.version]));
                } else {
                  packages.get(key).add(pkg.version);
                }
                hasRSP ||= pkg.scope === 'react-spectrum';
              }
            }

            let errors = [];
            for (let [pkg, versions] of packages) {
              if (versions.size > 1) {
                errors.push(`    ${pkg}: ${[...versions].join(', ')}`);
              }
            }

            if (errors.length) {
              errors.sort();
              throw new ReportError(
                MessageName.EXCEPTION,
                `Found multiple installed versions of ${hasRSP ? 'React Spectrum' : 'React Aria'} packages: \n\n`
                  + errors.join('\n')
                  + '\n\n You may be able to fix this by running `yarn dedupe`.'
              );
            }
          }
        }
      }
    };
  }
};
