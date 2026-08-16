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

const REACT_ARIA_PACKAGES = [
  '@react-stately',
  '@react-aria',
  '@react-spectrum',
  '@adobe/react-spectrum',
  'react-stately',
  'react-aria',
  'react-aria-components'
];
const LOCALE_EXTENSIONS = ['json', 'mjs', 'js', 'cjs'];

let plugin = createUnplugin(({locales}) => {
  locales = locales.map(l => new Intl.Locale(l));
  return {
    name: 'locales-plugin',
    vite: {
      enforce: 'pre'
    },
    resolveId(specifier, sourcePath, options) {
      if (
        !/[/\\](@react-stately|@react-aria|@react-spectrum|@adobe[/\\]react-spectrum|react-stately|react-aria|react-aria-components)[/\\]/.test(
          sourcePath
        ) ||
        options?.ssr
      ) {
        return;
      }

      let match = specifier.match(/[a-z]{2}-[A-Z]{2}/);
      if (match) {
        let locale = new Intl.Locale(match[0]);
        if (!locales.some(l => localeMatches(locale, l))) {
          return path.join(__dirname, 'empty.js');
        }
      }

      return null;
    }
  };
});

plugin.turbopack = options => {
  let loader = path.join(__dirname, 'LocalesLoader.js');
  let hasConditions = Array.isArray(options);
  if (hasConditions && options.length === 0) {
    throw new TypeError('Expected at least one Turbopack locale configuration.');
  }

  let configurations = hasConditions ? options : [options];
  let rules = {};
  for (let packageName of REACT_ARIA_PACKAGES) {
    for (let extension of LOCALE_EXTENSIONS) {
      let packageRules = configurations.map(({locales, condition}) => {
        let rule = {
          loaders: [
            {
              loader,
              options: {locales}
            }
          ],
          as: '*.js'
        };

        if (condition !== undefined) {
          rule.condition = condition;
        }

        return rule;
      });

      rules[`**/${packageName}/**/??-??.${extension}`] = hasConditions
        ? packageRules
        : packageRules[0];
    }
  }

  return {rules};
};

module.exports = plugin;

function localeMatches(localeToMatch, includedLocale) {
  return (
    localeToMatch.language === includedLocale.language &&
    (!includedLocale.region || localeToMatch.region === includedLocale.region)
  );
}
