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
// oxlint-disable-next-line
import 'mock-match-media/jest-setup';
// oxlint-disable-next-line
import {cleanup as cleanupMatchMedia} from 'mock-match-media';
// oxlint-disable-next-line
import '@testing-library/jest-dom';

// this prints a nice stack like this
/**
 * TypeError: Converting circular structure to JSON --> starting at object with constructor
 * 'HTMLButtonElement' | property '__reactFiber$kmjivnwji9j' -> object with constructor 'FiberNode'
 * --- property 'stateNode' closes the circle at stringify (<anonymous>) at writeChannelMessage
 * (internal/child_process/serialization.js:118:20) at process.target._send
 * (internal/child_process.js:784:17) at process.target.send (internal/child_process.js:682:19) at
 * reportSuccess
 * (/Users/rsnow/GitProjects/react-spectrum/node_modules/jest-cli/node_modules/jest-worker/build/workers/processChild.js:67:11)
 */
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason;
  });
  // Avoid memory leak by adding too many listeners
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
}
const ERROR_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW = [
  'ReactDOM.render is no longer supported in React 18',
  'ReactDOM.render has not been supported since React 18',
  '`ReactDOMTestUtils.act` is deprecated in favor of `React.act`'
];

const WARNING_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW = ['Browserslist: caniuse-lite is outdated'];

function failTestOnConsoleError() {
  const error = console.error;

  console.error = function (message) {
    const allowedPattern =
      typeof message === 'string' &&
      ERROR_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW.find(pattern => message.indexOf(pattern) > -1);
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
    const allowedPattern =
      typeof message === 'string' &&
      WARNING_PATTERNS_WE_SHOULD_FIX_BUT_ALLOW.find(pattern => message.indexOf(pattern) > -1);

    if (allowedPattern) {
      return;
    }

    warn.apply(console, arguments);
    throw message instanceof Error ? message : new Error(message);
  };
}

expect.extend({
  toContainObject(received, argument) {
    const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(argument)]));

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`,
        pass: true
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`,
        pass: false
      };
    }
  }
});

failTestOnConsoleWarn();
failTestOnConsoleError();

// JSDOM does not implement VisualViewport or ScreenOrientation API.
const visualViewport = Object.assign(new EventTarget(), {
  offsetTop: 0,
  offsetLeft: 0,
  pageTop: 0,
  pageLeft: 0,
  scale: 1
});

const orientation = Object.assign(new EventTarget(), {
  type: 'landscape-primary'
});

Object.defineProperty(window.screen, 'orientation', {
  value: orientation,
  configurable: true,
  writable: true
});

Object.defineProperty(window, 'visualViewport', {
  value: visualViewport,
  configurable: true,
  writable: true
});

beforeEach(() => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;

  // Proxy client dimensions to the window to match jsdom's default.
  // This is needed because they default to 0 in jsdom unless explicitly set.
  Object.defineProperty(document.documentElement, 'clientWidth', {
    get: () => window.innerWidth,
    configurable: true,
    writeable: false
  });

  Object.defineProperty(document.documentElement, 'clientHeight', {
    get: () => window.innerHeight,
    configurable: true,
    writeable: false
  });

  Object.defineProperty(window.screen.orientation, 'angle', {
    get: () => window.orientation ?? 0,
    configurable: true,
    writeable: false
  });

  Object.defineProperty(visualViewport, 'width', {
    get: () => window.innerWidth,
    configurable: true,
    writeable: false
  });

  Object.defineProperty(visualViewport, 'height', {
    get: () => window.innerHeight,
    configurable: true,
    writeable: false
  });

  Object.assign(visualViewport, {
    offsetTop: 0,
    offsetLeft: 0,
    pageTop: 0,
    pageLeft: 0,
    scale: 1
  });
});

afterEach(() => {
  delete window.IntersectionObserver;
  cleanupMatchMedia();
});
