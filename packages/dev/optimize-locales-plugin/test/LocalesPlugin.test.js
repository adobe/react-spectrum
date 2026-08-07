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
const LocalesPlugin = require('../LocalesPlugin');

const EMPTY_JS = path.join(path.dirname(require.resolve('../LocalesPlugin')), 'empty.js');

function createPlugin(locales = ['en-US']) {
  return LocalesPlugin.raw({locales}, {framework: 'rollup'});
}

function fakeImporter(pkgName) {
  return `/repo/node_modules/${pkgName}/dist/intlStrings.mjs`;
}

describe('@react-aria/optimize-locales-plugin', () => {
  describe('resolveId redirects non-included locales to empty.js for', () => {
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
      const plugin = createPlugin(['en-US']);
      const resolved = plugin.resolveId('./fr-FR.json', sourcePath, {});
      expect(resolved).toBe(EMPTY_JS);
    });
  });

  describe('resolveId leaves things alone when', () => {
    test('importer is outside React Spectrum / React Aria scopes', () => {
      const plugin = createPlugin(['en-US']);
      const resolved = plugin.resolveId('./fr-FR.json', fakeImporter('some-other-pkg'), {});
      expect(resolved).toBeUndefined();
    });

    test('specifier targets an included locale', () => {
      const plugin = createPlugin(['en-US', 'fr-FR']);
      const resolved = plugin.resolveId('./fr-FR.json', fakeImporter('@adobe/react-spectrum'), {});
      expect(resolved).toBeNull();
    });

    test('specifier targets a regional locale whose language is included without a region', () => {
      // Including a bare language ("fr") should keep every regional variant.
      const plugin = createPlugin(['en-US', 'fr']);
      const resolved = plugin.resolveId('./fr-CA.json', fakeImporter('@react-aria/button'), {});
      expect(resolved).toBeNull();
    });

    test('specifier does not look like a locale', () => {
      const plugin = createPlugin(['en-US']);
      const resolved = plugin.resolveId('./helpers', fakeImporter('@adobe/react-spectrum'), {});
      expect(resolved).toBeNull();
    });

    test('options.ssr is true', () => {
      const plugin = createPlugin(['en-US']);
      const resolved = plugin.resolveId('./fr-FR.json', fakeImporter('@adobe/react-spectrum'), {
        ssr: true
      });
      expect(resolved).toBeUndefined();
    });
  });

  test('handles Windows-style importer paths', () => {
    const plugin = createPlugin(['en-US']);
    const windowsImporter = 'C:\\repo\\node_modules\\@adobe\\react-spectrum\\dist\\intlStrings.mjs';
    const resolved = plugin.resolveId('./fr-FR.json', windowsImporter, {});
    expect(resolved).toBe(EMPTY_JS);
  });
});
