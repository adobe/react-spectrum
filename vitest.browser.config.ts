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

import {defineConfig} from 'vitest/config';
import fs from 'fs';
import macros from 'unplugin-parcel-macros';
import path from 'path';
import {playwright} from '@vitest/browser-playwright';
import type {Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

const s2Dir = path.resolve(__dirname, 'packages/@react-spectrum/s2');

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

// Resolve @react-spectrum/s2/illustrations/* imports
function illustrationResolverPlugin(): Plugin {
  return {
    name: 'illustration-resolver',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('@react-spectrum/s2/illustrations/')) {
        const illustrationPath = source.replace('@react-spectrum/s2/illustrations/', '');
        const tsxPath = path.resolve(s2Dir, 'spectrum-illustrations', illustrationPath + '.tsx');
        
        if (fs.existsSync(tsxPath)) {
          return tsxPath;
        }
        
        return null;
      }
      return null;
    }
  };
}

/**
 * Handle S2 illustrations
 * 
 * Resolves the SVG and wraps it with createIllustration from Icon.tsx.
 */
function illustrationPlugin(): Plugin {
  const VIRTUAL_PREFIX = '\0s2-illustration:';
  return {
    name: 'illustration-loader',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('illustration:')) {
        const svgPath = source.replace('illustration:', '');
        if (importer) {
          const dir = path.dirname(importer);
          const resolvedPath = path.resolve(dir, svgPath);
          return VIRTUAL_PREFIX + resolvedPath;
        }
      }
      return null;
    },
    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const svgPath = id.slice(VIRTUAL_PREFIX.length).replaceAll('\\', '/');
        return [
          `import {createIllustration} from '${path.resolve(s2Dir, 'src/Icon.tsx').replaceAll('\\', '/')}';`,
          `import SvgComponent from '${svgPath}';`,
          `export default /*#__PURE__*/ createIllustration(SvgComponent);`
        ].join('\n');
      }
      return null;
    }
  };
}

/**
 * Handle S2 workflow icons
 * 
 * Resolves the SVG and wraps it with createIcon from Icon.tsx.
 */
function iconWrapperPlugin(): Plugin {
  const VIRTUAL_PREFIX = '\0s2-icon:';
  const iconsDir = path.resolve(s2Dir, 's2wf-icons');

  // Build a map from icon name -> absolute SVG path
  const iconMap = new Map<string, string>();
  if (fs.existsSync(iconsDir)) {
    for (const file of fs.readdirSync(iconsDir)) {
      const match = file.match(/^S2_Icon_(.+)_20_N\.svg$/);
      if (match) {
        iconMap.set(match[1], path.resolve(iconsDir, file));
      }
    }
  }

  return {
    name: 'icon-wrapper',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('@react-spectrum/s2/icons/')) {
        const iconName = source.replace('@react-spectrum/s2/icons/', '');
        if (iconMap.has(iconName)) {
          return VIRTUAL_PREFIX + iconName;
        }
      }
      return null;
    },
    load(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const iconName = id.slice(VIRTUAL_PREFIX.length);
        const svgPath = iconMap.get(iconName);
        if (svgPath) {
          return [
            `import {createIcon} from '${path.resolve(s2Dir, 'src/Icon.tsx').replaceAll('\\', '/')}';`,
            `import SvgComponent from '${svgPath.replaceAll('\\', '/')}';`,
            `export default /*#__PURE__*/ createIcon(SvgComponent);`
          ].join('\n');
        }
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    // @ts-expect-error
    macros.vite(), // Must be first!
    // @ts-expect-error
    iconWrapperPlugin(), // Wrap @react-spectrum/s2/icons/* SVGs with createIcon
    // @ts-expect-error
    illustrationResolverPlugin(), // Resolve @react-spectrum/s2/illustrations/* imports
    // @ts-expect-error
    illustrationPlugin(), // Handle illustration: protocol
    // @ts-expect-error
    svgr({
      // Process all SVG files as React components
      include: [
        '**/s2wf-icons/**/*.svg',
        '**/ui-icons/**/*.svg',
        '**/spectrum-illustrations/**/*.svg'
      ],
      exclude: ['**/node_modules/**'],
      svgrOptions: {
        ref: true,
        typescript: false,
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false
                }
              }
            }
          ]
        }
      }
    }),
    // @ts-expect-error
    react(),
    // @ts-expect-error
    intlJsonPlugin()
  ],
  test: {
    globals: true,
    setupFiles: ['./test/browser/setup.ts'],
    include: ['packages/**/test/**/*.browser.test.{ts,tsx}'],
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
      include: ['packages/**/src/**/*.{ts,tsx}'],
      exclude: ['packages/**/src/**/*.d.ts', 'packages/**/src/index.ts']
    },
    testTimeout: 20000
  },
  resolve: {
    conditions: ['source', 'import', 'module', 'default'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.svg'],
    alias: {
      '@react-spectrum/s2/illustrations': path.resolve(s2Dir, 'spectrum-illustrations'),
      '@react-spectrum/s2': path.resolve(s2Dir, 'src')
    }
  },
  optimizeDeps: {
    exclude: ['@parcel/macros']
  },
  css: {
    postcss: {
      // @ts-expect-error
      config: false
    }
  }
});
