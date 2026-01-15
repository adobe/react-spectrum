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
import safeEventTargetRule from '../rules/safe-event-target.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  'safe-event-target',
  safeEventTargetRule,
  {
    // 'valid' checks cases that should pass
    valid: [
      {
        code: `import {getEventTarget} from '@react-aria/utils';
const target = getEventTarget(event);`
      },
      {
        code: `import {getEventTarget} from '@react-aria/utils';
function handleClick(e) {
  const target = getEventTarget(e);
  console.log(target);
}`
      },
      {
        code: `function checkTarget(props) {
  return props.target;
}`
      },
      {
        code: 'const value = target.target;'
      },
      {
        code: `function focusTarget(ref) {
  ref.target.focus();
}`
      },
      {
        code: `const link = {target: '_blank'};
console.log(link.target);`
      }
    ],
    // 'invalid' checks cases that should not pass
    invalid: [
      {
        code: `function handleClick(event) {
  const target = event.target;
}`,
        output: `import {getEventTarget} from '@react-aria/utils';
function handleClick(event) {
  const target = getEventTarget(event);
}`,
        errors: 1
      },
      {
        code: 'const element = e.target;',
        output: `import {getEventTarget} from '@react-aria/utils';
const element = getEventTarget(e);`,
        errors: 1
      },
      {
        code: `import {something} from '@react-aria/utils';
function handleEvent(evt) {
  console.log(evt.target);
}`,
        output: `import {getEventTarget, something} from '@react-aria/utils';
function handleEvent(evt) {
  console.log(getEventTarget(evt));
}`,
        errors: 1
      },
      {
        code: `import {getEventTarget} from '@react-aria/utils';
function handleClick(event) {
  const target = event.target;
}`,
        output: `import {getEventTarget} from '@react-aria/utils';
function handleClick(event) {
  const target = getEventTarget(event);
}`,
        errors: 1
      },
      {
        code: `import React from 'react';
const onClick = (e) => {
  const target = e.target;
  const value = e.target.value;
};`,
        output: `import React from 'react';
import {getEventTarget} from '@react-aria/utils';
const onClick = (e) => {
  const target = getEventTarget(e);
  const value = getEventTarget(e).value;
};`,
        errors: 2
      },
      {
        code: `function onKeyDown(event) {
  if (event.target instanceof HTMLElement) {
    event.target.focus();
  }
}`,
        output: `import {getEventTarget} from '@react-aria/utils';
function onKeyDown(event) {
  if (getEventTarget(event) instanceof HTMLElement) {
    getEventTarget(event).focus();
  }
}`,
        errors: 2
      }
    ]
  }
);
