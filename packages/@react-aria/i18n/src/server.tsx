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

import type {LocalizedString} from '@internationalized/string';
import React from 'react';

type PackageLocalizedStrings = {
  [packageName: string]: Record<string, LocalizedString>
};

interface PackageLocalizationProviderProps {
  locale: string,
  strings: PackageLocalizedStrings
}

/**
 * A PackageLocalizationProvider can be rendered on the server to inject the localized strings
 * needed by the client into the initial HTML.
 */
export function PackageLocalizationProvider(props: PackageLocalizationProviderProps) {
  if (typeof document !== 'undefined') {
    console.log('PackageLocalizationProvider should only be rendered on the server.');
    return null;
  }

  let {locale, strings} = props;
  return <script dangerouslySetInnerHTML={{__html: getPackageLocalizationScript(locale, strings)}} />;
}

/**
 * Returns the content for an inline `<script>` tag to inject localized strings into initial HTML.
 */
export function getPackageLocalizationScript(locale: string, strings: PackageLocalizedStrings) {
  return `window[Symbol.for('react-aria.i18n.locale')]=${JSON.stringify(locale)};{${serialize(strings)}}`;
}

const cache = new WeakMap<PackageLocalizedStrings, string>();

function serialize(strings: PackageLocalizedStrings): string {
  let cached = cache.get(strings);
  if (cached) {
    return cached;
  }

  // Find common strings between packages and hoist them into variables.
  let seen = new Set();
  let common = new Map();
  for (let pkg in strings) {
    for (let key in strings[pkg]) {
      let v = strings[pkg][key];
      let s = typeof v === 'string' ? JSON.stringify(v) : v.toString();
      if (seen.has(s) && !common.has(s)) {
        let name = String.fromCharCode(common.size > 25 ? common.size + 97 : common.size + 65);
        common.set(s, name);
      }
      seen.add(s);
    }
  }

  let res = '';
  if (common.size > 0) {
    res += 'let ';
  }
  for (let [string, name] of common) {
    res += `${name}=${string},`;
  }
  if (common.size > 0) {
    res = res.slice(0, -1) + ';';
  }

  res += "window[Symbol.for('react-aria.i18n.strings')]={";
  for (let pkg in strings) {
    res += `'${pkg}':{`;
    for (let key in strings[pkg]) {
      let v = strings[pkg][key];
      let s = typeof v === 'string' ? JSON.stringify(v) : v.toString();
      if (common.has(s)) {
        s = common.get(s);
      }
      res += `${/[ ()]/.test(key) ? JSON.stringify(key) : key}:${s},`;
    }
    res = res.slice(0, -1) + '},';
  }
  res = res.slice(0, -1) + '};';
  cache.set(strings, res);
  return res;
}
