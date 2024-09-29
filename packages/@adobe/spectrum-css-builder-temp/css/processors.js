/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

function getProcessors(keepVars = false, notNested = true, secondNotNested = true) {
  return [
    require('postcss-import'),
    require('postcss-custom-properties')({
      noValueNotifications: 'error',
      warnings: !keepVars,
      preserve: false
    }),
    require('./plugins/postcss-custom-properties-passthrough')(),
    keepVars ? require('./plugins/postcss-custom-properties-mapping')() : null,
    {
      postcssPlugin: 'postcss-remove-root',
      OnceExit(root) {
        root.walkRules(rule => {
          if (rule.selector === ':root') {
            rule.remove();
          }
        });
      }
    }
  ].filter(Boolean);
}

exports.processors = getProcessors(true);
