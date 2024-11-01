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

import noReactKeyRule from '../rules/no-react-key.js';
import {RuleTester} from 'eslint';


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
  noReactKeyRule, // rule code
  { // checks
    // 'valid' checks cases that should pass
    valid: [{
      code: "import {Key} from '@react-types/shared';"
    }],
    // 'invalid' checks cases that should not pass
    invalid: [{
      code: "import {Key} from 'react';",
      output: `
import {Key} from '@react-types/shared';`,
      errors: 1
    }, {
      code: "import React, {Key} from 'react';",
      output: `import React from 'react';
import {Key} from '@react-types/shared';`,
      errors: 1
    }, {
      code: `import React, {Key, useState} from 'react';
import {Foo} from 'bar';

let a = 'a';`,
      output: `import React, {useState} from 'react';
import {Foo} from 'bar';
import {Key} from '@react-types/shared';

let a = 'a';`,
      errors: 1
    }, {
      code: "import {Key, ReactElement, ReactNode} from 'react';",
      output: `import {ReactElement, ReactNode} from 'react';
import {Key} from '@react-types/shared';`,
      errors: 1
    }, {
      code: "import {HTMLAttributes, Key, RefObject} from 'react';",
      output: `import {HTMLAttributes, RefObject} from 'react';
import {Key} from '@react-types/shared';`,
      errors: 1
    }, {
      code: `
import {foo} from '@react-types/shared';
import {Key} from 'react';`,
      output: `
import {foo, Key} from '@react-types/shared';
`,
      errors: 1
    }, {
      code: `
import {Node} from '@react-types/shared';
import React, {Fragment, Key} from 'react';
`,
      output: `
import {Node, Key} from '@react-types/shared';
import React, {Fragment} from 'react';
`,
      errors: 1
    }, {
      code: `
import React from 'react';
let a = React.Key;
`,
      errors: 1
    }, {
      code: `
import React from 'react';
let a = useState<React.Key>(null);
`,
      errors: 1
    }]
  }
);
