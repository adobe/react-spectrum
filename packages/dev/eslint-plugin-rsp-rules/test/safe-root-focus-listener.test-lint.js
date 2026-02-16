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
import safeRootFocusListenerRule from '../rules/safe-root-focus-listener.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  }
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  'safe-root-focus-listener',
  safeRootFocusListenerRule,
  {
    // 'valid' checks cases that should pass
    valid: [
      {
        code: `
  root.addEventListener('blur', onBlur, true);
  root.addEventListener('focusout', onFocusOut, true);
  root.addEventListener('focusin', onFocusIn, true);
  root.addEventListener('focus', onFocus, true);
  root.removeEventListener('blur', onBlur, true);
  root.removeEventListener('focusout', onFocusOut, true);
  root.removeEventListener('focusin', onFocusIn, true);
  root.removeEventListener('focus', onFocus, true);
`
      }
    ],
    // 'invalid' checks cases that should not pass
    invalid: [
      {
        code: `
  window.addEventListener('blur', onBlur, true);
  window.addEventListener('focusout', onFocusOut, true);
  window.addEventListener('focusin', onFocusIn, true);
  window.addEventListener('focus', onFocus, true);
  window.removeEventListener('blur', onBlur, true);
  window.removeEventListener('focusout', onFocusOut, true);
  window.removeEventListener('focusin', onFocusIn, true);
  window.removeEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);
  document.addEventListener('focusout', onFocusOut, true);
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('focus', onFocus, true);
  document.removeEventListener('blur', onBlur, true);
  document.removeEventListener('focusout', onFocusOut, true);
  document.removeEventListener('focusin', onFocusIn, true);
  document.removeEventListener('focus', onFocus, true);
`,
        errors: 16
      }
    ]
  }
);
