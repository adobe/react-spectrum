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
import svgr from 'vite-plugin-svgr';

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
        const tsxPath = path.resolve(__dirname, 'spectrum-illustrations', illustrationPath + '.tsx');
        
        if (fs.existsSync(tsxPath)) {
          return tsxPath;
        }
        
        return null;
      }
      return null;
    }
  };
}

// Handle illustration: protocol
function illustrationPlugin(): Plugin {
  return {
    name: 'illustration-loader',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('illustration:')) {
        // Convert illustration:./path.svg to actual SVG path
        const svgPath = source.replace('illustration:', '');
        if (importer) {
          const dir = path.dirname(importer);
          const resolvedPath = path.resolve(dir, svgPath);
          return resolvedPath;
        }
      }
      return null;
    }
  };
}

// Build icon aliases to resolve @react-spectrum/s2/icons/* imports
function buildIconAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};
  const iconsDir = path.resolve(__dirname, 's2wf-icons');
  
  if (fs.existsSync(iconsDir)) {
    const iconFiles = fs.readdirSync(iconsDir).filter(f => f.startsWith('S2_Icon_') && f.endsWith('_20_N.svg'));
    
    for (const iconFile of iconFiles) {
      // Extract icon name: S2_Icon_Feedback_20_N.svg -> Feedback
      const match = iconFile.match(/^S2_Icon_(.+)_20_N\.svg$/);
      if (match) {
        const iconName = match[1];
        const iconPath = path.resolve(iconsDir, iconFile);
        aliases[`@react-spectrum/s2/icons/${iconName}`] = iconPath;
      }
    }
  }
  
  return aliases;
}

export default defineConfig({
  plugins: [
    macros.vite(), // Must be first!
    illustrationResolverPlugin(), // Resolve @react-spectrum/s2/illustrations/* imports
    illustrationPlugin(), // Handle illustration: protocol
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
    react(),
    intlJsonPlugin()
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
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.svg'],
    alias: {
      ...buildIconAliases(),
      '@react-spectrum/s2/illustrations': path.resolve(__dirname, 'spectrum-illustrations'),
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
