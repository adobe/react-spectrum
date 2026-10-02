/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const path = require('path');

module.exports = function localesLoader(source) {
  let {locales} = this.getOptions();
  let includedLocales = locales.map(locale => new Intl.Locale(locale));
  let match = path.basename(this.resourcePath).match(/[a-z]{2}-[A-Z]{2}/);
  if (match) {
    let locale = new Intl.Locale(match[0]);
    if (!includedLocales.some(includedLocale => localeMatches(locale, includedLocale))) {
      return 'export default undefined;';
    }
  }

  if (path.extname(this.resourcePath) === '.json') {
    return `export default ${source.toString()};`;
  }

  return source;
};

function localeMatches(localeToMatch, includedLocale) {
  return (
    localeToMatch.language === includedLocale.language &&
    (!includedLocale.region || localeToMatch.region === includedLocale.region)
  );
}
