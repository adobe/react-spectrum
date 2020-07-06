/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// setup file
import '@testing-library/jest-dom';

const ERROR_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW = [
  'An update to %s inside a test was not wrapped in act'
];

const WARNING_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW = [];

function failTestOnConsoleError() {
  const error = console.error;

  console.error = function (message) {
    const allowedPattern = ERROR_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW.find(pattern => message.indexOf(pattern) > -1);

    if (allowedPattern) {
      return;
    }

    error.apply(console, arguments);
    throw message instanceof Error ? message : new Error(message);
  };
}

function failTestOnConsoleWarn() {
  const warn = console.warn;

  console.warn = function (message) {
    const allowedPattern = WARNING_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW.find(pattern => message.indexOf(pattern) > -1);

    if (allowedPattern) {
      return;
    }

    warn.apply(console, arguments);
    throw message instanceof Error ? message : new Error(message);
  };
}

failTestOnConsoleWarn();
failTestOnConsoleError();
