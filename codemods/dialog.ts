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
import {referencesRSPImport} from './utils';

export function transformDialog(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>) {
  j(path).childElements().forEach(path => {
    // S2 dialogs don't have a divider anymore.
    if (referencesRSPImport(path, 'Divider')) {
      path.prune();
    }
  });
}

export function transformDialogTrigger(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>) {
  j(path).childNodes().forEach(path => {
    // Move close function inside dialog.
    // TODO: handle other types of functions too?
    if (path.value.type === 'JSXExpressionContainer' && path.value.expression.type === 'ArrowFunctionExpression') {
      let body = path.value.expression.body;
      if (body.type === 'JSXElement' && referencesRSPImport(path.get('expression').get('body'), 'Dialog')) {
        body.children = [j.jsxExpressionContainer(
          j.arrowFunctionExpression(
            path.value.expression.params,
            j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), body.children)
          )
        )];
        path.replace(body);
      } else {
        if (!path.value.expression.body.comments) {
          path.value.expression.body.comments = [];
        }
        path.get('expression').get('body').get('comments').push(j.line(' TODO: update this dialog to move the close function inside', true, false));
      }
    }
  });
}
