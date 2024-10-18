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
import sortImportsRule from '../rules/sort-imports.js';


const ruleTester = new RuleTester({
  // Must use at least ecmaVersion 2015 because
  // that's when `const` variables were introduced.
  languageOptions: {
    ecmaVersion: 2015
  }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  'no-react-key', // rule name
  sortImportsRule, // rule code
  { // checks
    // 'valid' checks cases that should pass
    valid: [{
      code: "import {A, B} from 'foo';"
    }, {
      code: `
import {A} from 'foo';
import {B} from 'bar';
`
    }],
    // 'invalid' checks cases that should not pass
    invalid: [{
      code: "import {B, A} from 'foo';",
      output: "import {A, B} from 'foo';",
      errors: 1
    },
    // we don't support this case yet
    {
      code: `
import {B} from 'bar';
import {A} from 'foo';
`,
      output: `
import {A} from 'foo';
import {B} from 'bar';
`,
      errors: 1
    }
    ]
  }
);
