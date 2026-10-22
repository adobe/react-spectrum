/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RuleTester} from 'eslint';
import shadowSafeParentNodeRule from '../rules/shadow-safe-parent-node.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run('shadow-safe-parent-node', shadowSafeParentNodeRule, {
  // 'valid' checks cases that should pass
  valid: [
    {
      code: `
import {getParentNode} from '@react-aria/utils';
if (getParentNode(document.body)) {
  console.log('root node');
}`
    }
  ],
  // 'invalid' checks cases that should not pass
  invalid: [
    {
      code: `
if (document.body.parentNode) {
  console.log('root node');
}`,
      output: `
import {getParentNode} from '@react-aria/utils';
if (getParentNode(document.body)) {
  console.log('root node');
}`,
      errors: 1
    }
  ]
});
