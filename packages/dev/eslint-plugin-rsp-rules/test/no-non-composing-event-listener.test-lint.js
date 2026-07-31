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

import noNonComposingEventListenerRule from '../rules/no-non-composing-event-listener.js';
import {RuleTester} from 'eslint';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020
  }
});

ruleTester.run('no-non-composing-event-listener', noNonComposingEventListenerRule, {
  valid: [
    // Composing event, not in the list.
    {code: "el.addEventListener('click', fn)"},
    // Non-literal event — cannot be statically verified.
    {code: 'el.addEventListener(evt, fn)'},
    // Non-shadow-tree receivers where getPropagationTargets does not apply.
    {code: "visualViewport.addEventListener('scroll', fn)"},
    {code: "mq.addEventListener('change', fn)"},
    {code: "m.addEventListener('change', fn)"},
    // Not an addEventListener call.
    {code: "el.addListener('scroll', fn)"}
  ],
  invalid: [
    {code: "window.addEventListener('scroll', fn)", errors: 1},
    {code: "document.addEventListener('change', fn)", errors: 1},
    {code: "input.addEventListener('change', fn)", errors: 1},
    {code: "form.addEventListener('reset', fn)", errors: 1},
    {code: "el.addEventListener('slotchange', fn)", errors: 1},
    {code: "getOwnerDocument(el).addEventListener('scroll', fn)", errors: 1}
  ]
});
