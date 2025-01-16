/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {Transformer} = require('@parcel/plugin');
const {transform} = require('@svgr/core');
const path = require('path');
const tokens = require('@adobe/spectrum-tokens/dist/json/variables.json');
const crypto = require('crypto');

module.exports = new Transformer({
  async transform({asset}) {
    let contents = await asset.getCode();
    let iconName = path.basename(asset.filePath, '.svg');
    let hash = crypto.createHash('md5');
    hash.update(iconName);
    let prefix = hash.digest('hex').slice(-6);
    let optimized = (await transform(
      contents,
      {
        jsxRuntime: 'automatic',
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  inlineStyles: {
                    onlyMatchedOnce: false,
                    removeMatchedSelectors: true
                  },
                  convertPathData: {
                    makeArcs: false
                  }
                }
              }
            },
            {
              name: 'prefixIds',
              params: {
                prefix
              }
            },
            {
              name: 'removeAttrs',
              params: {
                attrs: ['data.*']
              }
            }
          ]
        },
        replaceAttrValues: {
          'var(--iconPrimary, #222)': `var(--iconPrimary, var(--lightningcss-light, ${tokens['gray-800'].sets.light.value}) var(--lightningcss-dark, ${tokens['gray-800'].sets.dark.value}))`,
          'var(--spectrum-global-color-gray-800, #292929)': `var(--iconPrimary, var(--lightningcss-light, ${tokens['gray-800'].sets.light.value}) var(--lightningcss-dark, ${tokens['gray-800'].sets.dark.value}))`
        },
        typescript: true,
        ref: true,
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx']
      })
    ).replace('export default ForwardRef;', '');
    let newFile = template(asset, optimized);
    return [{
      type: 'tsx',
      content: newFile,
      meta: {
        isRSPIcon: true
      }
    }];
  }
});

function template(asset, svg) {
  let normalizedPath = asset.filePath.replaceAll('\\', '/');
  let context = asset.pipeline === 'illustration' || normalizedPath.includes('@react-spectrum/s2/spectrum-illustrations') ? 'IllustrationContext' : 'IconContext';
  return (
`
import {createIcon, ${context}} from '${normalizedPath.includes('@react-spectrum/s2') ? '~/src/Icon' : '@react-spectrum/s2'}';

${svg.replace('import { SVGProps } from "react";', '')}

export default /*#__PURE__*/ createIcon(ForwardRef, ${context});
`
  );
}
