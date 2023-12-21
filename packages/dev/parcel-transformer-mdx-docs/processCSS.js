/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const lightningcss = require('lightningcss');
const fs = require('fs');
const path = require('path');

module.exports = async function processCSS(cssCode, asset, options, minimal = false) {
  let visit = (await import('unist-util-visit')).visit;
  let unified = (await import('unified')).unified;
  let remarkParse = (await import('remark-parse')).default;
  let remarkMdx = (await import('remark-mdx')).default;
  let transformed = await lightningcss.bundleAsync({
    filename: `${asset.filePath}.lightning`,
    minify: true,
    drafts: {
      nesting: true
    },
    targets: {
      chrome: 95 << 16,
      safari: 15 << 16
    },
    resolver: {
      resolve(specifier, parent) {
        if (specifier.startsWith('.')) {
          return path.resolve(path.dirname(parent), specifier);
        }

        if (path.extname(specifier) === '') {
          // Assume this is a package.
          specifier += '/src/index.css';
          return require.resolve(specifier);
        }

        let baseDir = process.env.DOCS_ENV === 'production' ? 'docs' : 'packages';
        return path.resolve(options.projectRoot, baseDir, specifier);
      },
      read(filePath) {
        if (filePath === `${asset.filePath}.lightning`) {
          return cssCode.join('\n');
        }
        asset.invalidateOnFileChange(filePath);

        let result = '';
        try {
          let contents = fs.readFileSync(filePath, 'utf8');
          if (path.extname(filePath) === '.css') {
            return contents;
          }
          // get all css blocks and concat
          let ast = unified().use(remarkParse).use(remarkMdx).parse(contents);
          visit(ast, 'code', node => {
            if (node.lang !== 'css' || node?.meta?.includes('render=false') || node?.meta?.includes('hidden')) {
              return;
            }
            let code = node.value;
            code = code.replace(/@import.*/g, '');
            result += code;
          });
        } catch (e) {
          console.log(e);
        }
        return result;
      }
    },
    visitor: minimal ? null : {
      Rule: {
        media(m) {
          // Convert dark mode media query to use docs color scheme.
          let mediaQueries = m.value.query.mediaQueries;
          let condition = mediaQueries[0].condition;
          let isDarkMode = mediaQueries.length === 1
            && condition.type === 'feature'
            && condition.value.type === 'plain'
            && condition.value.name === 'prefers-color-scheme'
            && condition.value.value.value === 'dark';
          if (isDarkMode) {
            return {
              type: 'style',
              value: {
                // Generates this selector: `:root[style*="color-scheme: dark"]`
                selectors: [[
                  {type: 'pseudo-class', kind: 'root'},
                  {type: 'attribute', name: 'style', operation: {operator: 'substring', value: 'color-scheme: dark'}}
                ]],
                loc: m.value.loc,
                declarations: m.value.rules[0].value.declarations
              }
            };
          }
        }
      }
    }
  });

  return transformed.code.toString();
};
