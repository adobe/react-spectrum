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
const resolverInstance = require('../LocalesResolver');

const RESOLVER_DIR = path.dirname(require.resolve('../LocalesResolver'));
const EMPTY_JS = path.join(RESOLVER_DIR, 'empty.js');

// `@parcel/plugin` stores the user-supplied config under a well-known Symbol.
// Reach in to invoke the `resolve` hook directly in a unit test.
const CONFIG = Symbol.for('parcel-plugin-config');
const {resolve} = resolverInstance[CONFIG];

function call(specifier, sourcePath, locales = ['en-US']) {
  return resolve({
    specifier,
    dependency: {sourcePath},
    config: locales.map(l => new Intl.Locale(l))
  });
}

function fakeImporter(pkgName) {
  return `/repo/node_modules/${pkgName}/dist/intlStrings.mjs`;
}

describe('@react-aria/parcel-resolver-optimize-locales', () => {
  describe('resolve redirects non-included locales to empty.js for', () => {
    const cases = [
      ['@react-stately/combobox', fakeImporter('@react-stately/combobox')],
      ['@react-aria/button', fakeImporter('@react-aria/button')],
      ['@react-spectrum/button', fakeImporter('@react-spectrum/button')],
      ['react-stately', fakeImporter('react-stately')],
      ['react-aria', fakeImporter('react-aria')],
      ['react-aria-components', fakeImporter('react-aria-components')],
      ['@adobe/react-spectrum', fakeImporter('@adobe/react-spectrum')]
    ];

    test.each(cases)('importer under %s', (_label, sourcePath) => {
      const resolved = call('./fr-FR.json', sourcePath);
      expect(resolved).toEqual({filePath: EMPTY_JS});
    });
  });

  describe('resolve leaves things alone when', () => {
    test('importer is outside React Spectrum / React Aria scopes', () => {
      const resolved = call('./fr-FR.json', fakeImporter('some-other-pkg'));
      expect(resolved).toBeUndefined();
    });

    test('specifier targets an included locale', () => {
      const resolved = call('./fr-FR.json', fakeImporter('@adobe/react-spectrum'), [
        'en-US',
        'fr-FR'
      ]);
      expect(resolved).toBeUndefined();
    });

    test('specifier does not look like a locale', () => {
      const resolved = call('./helpers', fakeImporter('@adobe/react-spectrum'));
      expect(resolved).toBeUndefined();
    });

    test('config is missing or not loaded', () => {
      const resolved = resolve({
        specifier: './fr-FR.json',
        dependency: {sourcePath: fakeImporter('@adobe/react-spectrum')},
        config: undefined
      });
      expect(resolved).toBeUndefined();
    });
  });

  test('handles Windows-style importer paths', () => {
    const windowsImporter = 'C:\\repo\\node_modules\\@adobe\\react-spectrum\\dist\\intlStrings.mjs';
    const resolved = call('./fr-FR.json', windowsImporter);
    expect(resolved).toEqual({filePath: EMPTY_JS});
  });
});
