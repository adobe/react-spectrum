/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import addEventNonComposingRule from '../rules/add-event-non-composing.js';
import {RuleTester} from 'eslint';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020
  }
});

ruleTester.run('add-event-non-composing', addEventNonComposingRule, {
  valid: [
    // Target is getPropagationTargets(...) — the correct pattern.
    {code: "addEvent(getPropagationTargets(el), 'scroll', fn)"},
    {
      code: "addEvent(getPropagationTargets(ref.current, getOwnerDocument(ref.current)), 'scroll', fn)"
    },
    // Composing event, not in the list.
    {code: "addEvent(document, 'touchstart', fn)"},
    // Non-literal event — cannot be statically verified.
    {code: 'addEvent(window, someVar, fn)'},
    // Not a call to addEvent.
    {code: "addSomethingElse(window, 'scroll', fn)"}
  ],
  invalid: [
    {code: "addEvent(window, 'scroll', fn)", errors: 1},
    {code: "addEvent(document, 'change', fn)", errors: 1},
    {code: "addEvent(el, 'slotchange', fn)", errors: 1},
    {code: "addEvent(target, 'selectstart', fn)", errors: 1},
    {code: "addEvent(notPropagation(el), 'scroll', fn)", errors: 1}
  ]
});
