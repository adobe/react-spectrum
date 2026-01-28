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

import fasterNodeContainsRule from '../rules/faster-node-contains.js';
import {RuleTester} from 'eslint';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  'faster-node-contains',
  fasterNodeContainsRule,
  {
    // 'valid' checks cases that should pass
    valid: [
      {
        code: `
if (nodeContains(element, other)) {
  console.log('contained');
}`
      }
    ],
    // 'invalid' checks cases that should not pass
    invalid: [
      {
        code: `
if (nodeContains(element, document.activeElement)) {
  console.log('contained');
}`,
        output: `
if (element.matches(':focus-within')) {
  console.log('contained');
}`,
        errors: 1
      },
      {
        code: `
if (nodeContains(document, other)) {
  console.log('connected');
}`,
        output: `
if (other.isConnected) {
  console.log('connected');
}`,
        errors: 1
      }
    ]
  }
);
