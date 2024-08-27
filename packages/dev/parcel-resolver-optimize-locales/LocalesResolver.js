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
const {Resolver} = require('@parcel/plugin');

module.exports = new Resolver({
  async loadConfig({config}) {
    let conf = await config.getConfig([], {
      packageKey: 'locales'
    });
    if (Array.isArray(conf?.contents)) {
      return conf.contents.map(l => new Intl.Locale(l));
    }
  },
  resolve({specifier, dependency, config}) {
    if (!Array.isArray(config) || !/[/\\](@react-stately|@react-aria|@react-spectrum|react-aria-components)[/\\]/.test(dependency.sourcePath)) {
      return;
    }

    let match = specifier.match(/[a-z]{2}-[A-Z]{2}/);
    if (match) {
      let locale = new Intl.Locale(match[0]);
      if (!config.some(l => localeMatches(locale, l))) {
        return {filePath: __dirname + '/empty.js'};
      }
    }
  }
});

function localeMatches(localeToMatch, includedLocale) {
  return localeToMatch.language === includedLocale.language
    && (!includedLocale.region || localeToMatch.region === includedLocale.region);
}
