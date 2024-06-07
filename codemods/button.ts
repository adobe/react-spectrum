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

import {API, ASTPath} from 'jscodeshift';
import {namedTypes} from 'ast-types';
import {getPropValue} from './utils';

export function transformButton(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>) {
  j(path.node.openingElement).find(j.JSXAttribute).forEach(path => {
    let prop = path.value.name;
    let value = getPropValue(path.value.value);
    if (prop.type !== 'JSXIdentifier' || !value) {
      return;
    }

    switch (prop.name) {
      case 'variant': {
        if (value.type === 'StringLiteral') {
          if (value.value === 'cta') {
            value.value = 'accent';
          } else if (value.value === 'overBackground') {
            value.value = 'primary';
            path.insertAfter(j.jsxAttribute(
              j.jsxIdentifier('staticColor'),
              j.stringLiteral('white')
            ));
          }
        }
        break;
      }
    }
  });
}
