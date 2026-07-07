/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {isKeyboardOpen, supportsKeyboard, willOpenKeyboard} from '../../src/utils/keyboard';

describe('keyboard', function () {
  let clock = Date.now();

  let width = window.innerWidth;
  let height = window.innerHeight;  

  function openKeyboard(): void {
    let input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      document.body.removeChild(input);
    }));
  }

  function closeKeyboard(): void {
    let button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    document.body.removeChild(button);
  }

  function resize(rect: Pick<DOMRect, 'width' | 'height'>) {
    if (rect.width > rect.height !== window.innerWidth > window.innerHeight) {
      window.orientation = rect.width > rect.height ? 90 : 0;
      screen.orientation.dispatchEvent(new Event('change'));
    }

    if (rect.width !== window.innerWidth || rect.height !== window.innerHeight) {
      window.innerWidth = rect.width;
      window.innerHeight = rect.height;
      window.dispatchEvent(new Event('resize'));
      visualViewport?.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(200);
    }
  }

  beforeAll(() => {
    width = window.innerWidth;
    height = window.innerHeight;

    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(clock);

    jest.spyOn(window.performance, 'now').mockImplementation(() => Date.now());

    resize({width: 300, height: 800});
  });

  afterEach(() => {
    resize({width: 300, height: 800});

    jest.runOnlyPendingTimers();

    clock = Date.now() + 10000;

    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    window.innerWidth = width;
    window.innerHeight = height;
  });

  describe('willOpenKeyboard', function () {
    it('returns true for text inputs, textareas and contenteditable', function () {
      let input = document.createElement('input');
      let textarea = document.createElement('textarea');
      let editable = document.createElement('div');

      Object.defineProperty(editable, 'isContentEditable', {
        value: true,
        configurable: false,
        writable: false
      });

      expect(willOpenKeyboard(input)).toBe(true);
      expect(willOpenKeyboard(textarea)).toBe(true);
      expect(willOpenKeyboard(editable)).toBe(true);
    });

    it('returns false for non-text input types and non-inputs', function () {
      let button = document.createElement('button');
      let checkbox = document.createElement('input');
      checkbox.type = 'checkbox';

      expect(willOpenKeyboard(checkbox)).toBe(false);
      expect(willOpenKeyboard(button)).toBe(false);
      expect(willOpenKeyboard(null)).toBe(false);
    });
  });

  describe('isKeyboardOpen', function () {
    it('returns true when the keyboard is open', function () {
      openKeyboard();
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);
    });

    it('returns false when the keyboard is closed', function () {
      openKeyboard();
      resize({width: 300, height: 450});

      closeKeyboard();
      resize({width: 300, height: 800});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('ignores resizes below the threshold', function () {
      openKeyboard();
      resize({width: 300, height: 750});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('stays open on input-to-input focus', function () {
      openKeyboard();
      resize({width: 300, height: 450});

      openKeyboard();

      expect(isKeyboardOpen()).toBe(true);
    });

    it('supports orientation changes', function () {
      openKeyboard();
      resize({width: 800, height: 150});

      expect(isKeyboardOpen()).toBe(true);

      closeKeyboard();
      resize({width: 800, height: 300});

      expect(isKeyboardOpen()).toBe(false);

      resize({width: 300, height: 800});

      openKeyboard();
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);

      resize({width: 800, height: 150});

      expect(isKeyboardOpen()).toBe(true);

      closeKeyboard();
      resize({width: 800, height: 300});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('supports resizes before focus', function () {
      openKeyboard();
      closeKeyboard();
      jest.advanceTimersByTime(1000);

      resize({width: 300, height: 400});
      openKeyboard();

      expect(isKeyboardOpen()).toBe(true);
      expect(supportsKeyboard()).toBe(true);

      closeKeyboard();
      resize({width: 300, height: 800});
      jest.advanceTimersByTime(1000);

      openKeyboard();
      jest.advanceTimersByTime(700);
      expect(supportsKeyboard()).toBe(false);
    });
  });

  describe('supportsKeyboard', function () {
    it('returns the default while a transition is pending', function () {
      openKeyboard();

      expect(supportsKeyboard()).toBe(true);
    });

    it('returns true when the keyboard opened in time', function () {
      openKeyboard();
      resize({width: 300, height: 450});

      expect(supportsKeyboard()).toBe(true);
    });

    it('returns false when the keyboard did not open in time', function () {
      openKeyboard();
      jest.advanceTimersByTime(700);

      expect(supportsKeyboard()).toBe(false);
    });

    it('recovers when the keyboard opened in time', function () {
      openKeyboard();
      jest.advanceTimersByTime(700);
  
      expect(supportsKeyboard()).toBe(false);

      openKeyboard();
      resize({width: 300, height: 450});

      expect(supportsKeyboard()).toBe(true);
    });

    it('does not consider non-text input types and non-inputs', function () {
      openKeyboard();
      resize({width: 300, height: 450});

      expect(supportsKeyboard()).toBe(true);

      closeKeyboard();
      jest.advanceTimersByTime(700);

      expect(supportsKeyboard()).toBe(true);
    });

    it('returns false when the keyboard overlays the viewport', function () {
      let meta = document.createElement('meta');

      meta.name = 'viewport';
      meta.content = 'interactive-widget=overlays-content';

      document.head.appendChild(meta);

      expect(supportsKeyboard()).toBe(false);

      document.head.removeChild(meta);
    });
  });
});