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

module.exports = function () {
  /** @param info {import('typescript').server.PluginCreateInfo} */
  function create(info) {
    const proxy = Object.create(null);
    for (let k of Object.keys(info.languageService)) {
      const x = info.languageService[k];
      proxy[k] = (...args) => x.apply(info.languageService, args);
    }

    proxy.getCompletionEntryDetails = (...args) => {
      let result = info.languageService.getCompletionEntryDetails(...args);
      if (!result.codeActions) {
        return result;
      }

      // Override auto import of style macro to add `with {type: 'macro'}` automatically.
      for (let action of result.codeActions) {
        for (let change of action.changes) {
          for (let textChange of change.textChanges) {
            if (change.fileName.includes('@react-spectrum/s2')) {
              // For files inside S2 itself, import specifier will be '../style', not '@react-spectrum/s2/style'.
              textChange.newText = textChange.newText.replace(/(import\s*\{.*?\}\s*from\s*['"]\.\.\/style['"]);/g, '$1 with {type: \'macro\'};');
            } else {
              textChange.newText = textChange.newText.replace(/(import\s*\{.*?\}\s*from\s*['"]@react-spectrum\/s2\/style['"]);/g, '$1 with {type: \'macro\'};');
            }
          }
        }
      }
      
      return result;
    };

    return proxy;
  }

  return {create};
};
