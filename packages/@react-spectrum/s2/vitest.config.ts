/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {defineConfig, Plugin} from 'vitest/config';
import fs from 'fs';
import macros from 'unplugin-parcel-macros';
import path from 'path';
import {playwright} from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';

const svgMockPath = path.resolve(__dirname, 'test/__mocks__/svg.tsx');
const uiIconsMockPath = path.resolve(__dirname, 'test/__mocks__/ui-icons.tsx');

// Handles ../intl/*.json imports
function intlJsonPlugin(): Plugin {
  return {
    name: 'intl-json-loader',
    async resolveId(source, importer) {
      if (source.includes('/intl/*.json') && importer) {
        const dir = path.dirname(importer);
        const intlDir = path.resolve(dir, source.replace('*.json', ''));
        return `virtual:intl-messages:${intlDir}`;
      }
      return null;
    },
    async load(id) {
      if (id.startsWith('virtual:intl-messages:')) {
        const intlDir = id.replace('virtual:intl-messages:', '');
        try {
          const files = fs.readdirSync(intlDir).filter(f => f.endsWith('.json'));
          const messages: Record<string, Record<string, string>> = {};

          for (const file of files) {
            const locale = path.basename(file, '.json');
            const content = fs.readFileSync(path.join(intlDir, file), 'utf-8');
            messages[locale] = JSON.parse(content);
          }

          return `export default ${JSON.stringify(messages)};`;
        } catch {
          return 'export default {};';
        }
      }
      return null;
    }
  };
}

// Mock icon imports
function iconMockPlugin(): Plugin {
  return {
    name: 'style-plugin',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('@react-spectrum/s2/icons/')) {
        return svgMockPath;
      }
      if (source.startsWith('@react-spectrum/s2/illustrations/')) {
        return uiIconsMockPath;
      }
      // Intercept icon/illustration imports from s2 package
      if (importer && importer.includes('@react-spectrum/s2')) {
        // Match ui-icons imports
        if (source.match(/^\.\.?\/ui-icons\/[A-Z][a-zA-Z]*$/)) {
          return uiIconsMockPath;
        }
        // Match s2wf-icons SVG imports
        if (source.match(/^\.\.?\/s2wf-icons\/.*\.svg$/)) {
          return svgMockPath;
        }
        // Match spectrum-illustrations imports
        if (source.match(/^\.\.?\/spectrum-illustrations\//)) {
          return uiIconsMockPath;
        }
      }
      return null;
    }
  };
}

// Mock SVG imports
function svgMockPlugin(): Plugin {
  return {
    name: 'svg-mock',
    resolveId(source) {
      if (source.endsWith('.svg')) {
        return svgMockPath;
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    macros.vite(), // Must be first!
    iconMockPlugin(),
    svgMockPlugin(),
    intlJsonPlugin(),
    react()
  ],
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [
        {browser: 'chromium'},
        {browser: 'firefox'},
        {browser: 'webkit'}
      ]
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/index.ts']
    },
    testTimeout: 20000
  },
  resolve: {
    conditions: ['source', 'import', 'module', 'default'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      '@react-spectrum/s2/icons/Edit': svgMockPath,
      '@react-spectrum/s2/icons/Copy': svgMockPath,
      '@react-spectrum/s2/icons/Cut': svgMockPath,
      '@react-spectrum/s2/icons/Paste': svgMockPath,
      '@react-spectrum/s2/icons/Delete': svgMockPath,
      '@react-spectrum/s2/icons/Feedback': svgMockPath,
      '@react-spectrum/s2/illustrations/gradient/generic1/CloudUpload': uiIconsMockPath,
      '@react-spectrum/s2': path.resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    exclude: ['@parcel/macros']
  },
  css: {
    postcss: {
      // Disable PostCSS processing for macro-generated CSS
      // The macros plugin handles CSS generation, and PostCSS was causing parsing errors
      // with nested selectors like &:before
      config: false
    }
  }
});
