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
const {createUnplugin} = require('unplugin');
const path = require('path');

const localeSpecifierRegex = /[a-z]{2}-[A-Z]{2}/;
const sourcePathRegex =
  /[/\\](@react-stately|@react-aria|@react-spectrum|@adobe[/\\]react-spectrum|react-stately|react-aria|react-aria-components)[/\\]/;

module.exports = createUnplugin(({locales}) => {
  locales = locales.map(l => new Intl.Locale(l));
  return {
    name: 'locales-plugin',
    vite: {
      enforce: 'pre'
    },
    resolveId: {
      filter: {
        id: localeSpecifierRegex
      },
      handler(specifier, sourcePath, options) {
        if (!sourcePathRegex.test(sourcePath) || options?.ssr) {
          return;
        }

        let match = specifier.match(localeSpecifierRegex);
        if (match) {
          let locale = new Intl.Locale(match[0]);
          if (!locales.some(l => localeMatches(locale, l))) {
            return path.join(__dirname, 'empty.js');
          }
        }

        return null;
      }
    }
  };
});

function localeMatches(localeToMatch, includedLocale) {
  return (
    localeToMatch.language === includedLocale.language &&
    (!includedLocale.region || localeToMatch.region === includedLocale.region)
  );
}
