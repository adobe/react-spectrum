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

import noNonShadowContainsRule from '../rules/no-non-shadow-contains.js';
import {RuleTester} from 'eslint';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  'no-non-shadow-contains',
  noNonShadowContainsRule,
  {
    // 'valid' checks cases that should pass
    valid: [
      {
        code: `
import {nodeContains} from '@react-aria/utils';
if (nodeContains(element, other)) {
  console.log('contained');
}`
      },
      {
        code: `
import {nodeContains} from '@react-aria/utils';
const result = nodeContains(node1, node2);`
      }
    ],
    // 'invalid' checks cases that should not pass
    invalid: [
      {
        code: `
if (element.contains(other)) {
  console.log('contained');
}`,
        output: `
import {nodeContains} from '@react-aria/utils';
if (nodeContains(element, other)) {
  console.log('contained');
}`,
        errors: 1
      },
      {
        code: `
import {something} from '@react-aria/utils';
if (element.contains(other)) {
  console.log('contained');
}`,
        output: `
import {nodeContains, something} from '@react-aria/utils';
if (nodeContains(element, other)) {
  console.log('contained');
}`,
        errors: 1
      },
      {
        code: `
const result = node.contains(child);`,
        output: `
import {nodeContains} from '@react-aria/utils';
const result = nodeContains(node, child);`,
        errors: 1
      },
      {
        code: `
import {nodeContains} from '@react-aria/utils';
if (element.contains(other)) {
  console.log('contained');
}`,
        output: `
import {nodeContains} from '@react-aria/utils';
if (nodeContains(element, other)) {
  console.log('contained');
}`,
        errors: 1
      },
      {
        code: `
import React from 'react';
const isContained = ref.current.contains(target);`,
        output: `
import React from 'react';
import {nodeContains} from '@react-aria/utils';
const isContained = nodeContains(ref.current, target);`,
        errors: 1
      },
      {
        code: `
import {nodeContains} from '@react-aria/utils';
const a = element1.contains(child1);
const b = element2.contains(child2);`,
        output: `
import {nodeContains} from '@react-aria/utils';
const a = nodeContains(element1, child1);
const b = nodeContains(element2, child2);`,
        errors: 2
      },
      {
        code: `
if (document.body.contains(element)) {
  console.log('in body');
}`,
        output: `
import {nodeContains} from '@react-aria/utils';
if (nodeContains(document.body, element)) {
  console.log('in body');
}`,
        errors: 1
      }
    ]
  }
);
