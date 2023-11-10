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
import fs from 'fs';
import {transform} from '@svgr/core';

export function compileSVG(file, componentName = 'IconComponent') {
  let code = fs.readFileSync(file, 'utf8');
  return transform.sync(
    code,
    {
      plugins: [
        '@svgr/plugin-svgo',
        '@svgr/plugin-jsx'
      ],
      jsx: {
        babelConfig: {
          plugins: [
            [
              '@svgr/babel-plugin-remove-jsx-attribute',
              {
                elements: ['svg', 'path', 'circle', 'rect', 'ellipse'],
                attributes: ['width', 'height', 'fill', 'data-name', 'id', 'style']
              }
            ]
          ]
        }
      },
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                inlineStyles: {
                  onlyMatchedOnce: false
                }
              }
            }
          },
          {
            name: 'removeXMLNS'
          }
        ]
      },
      template: (variables, {tpl}) => tpl`
${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);`
    },
    {
      componentName
    }
  );
}
