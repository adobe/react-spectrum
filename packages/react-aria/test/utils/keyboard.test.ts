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

import {act} from '@react-spectrum/test-utils-internal';
import {isKeyboardOpen, supportsKeyboard, willOpenKeyboard} from '../../src/utils/keyboard';

describe('keyboard', function () {
  let input = document.createElement('input');
  let button = document.createElement('button');

  let clock = Date.now();

  let width = window.innerWidth;
  let height = window.innerHeight;

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
    document.body.appendChild(button);
    document.body.appendChild(input);

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
    jest.restoreAllMocks();

    act(() => button.focus());
    resize({width: 300, height: 800});

    jest.runOnlyPendingTimers();
    clock = Date.now() + 10000;
    jest.useRealTimers();
  });

  afterAll(() => {
    input.remove();
    button.remove();

    window.innerWidth = width;
    window.innerHeight = height;
  });

  describe('willOpenKeyboard', function () {
    it('returns true for focusable inputs and editable content areas', function () {
      let input = document.createElement('input');
      let textarea = document.createElement('textarea');
      let editable = document.createElement('div');

      editable.setAttribute('contenteditable', 'true');

      Object.defineProperty(editable, 'isContentEditable', {
        value: true,
        configurable: false,
        writable: false
      });

      document.body.appendChild(input);
      document.body.appendChild(textarea);
      document.body.appendChild(editable);

      expect(willOpenKeyboard(input)).toBe(true);
      expect(willOpenKeyboard(textarea)).toBe(true);
      expect(willOpenKeyboard(editable)).toBe(true);

      input.remove();
      textarea.remove();
      editable.remove();
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
      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);
    });

    it('returns false when the keyboard is closed', function () {
      act(() => input.focus());
      resize({width: 300, height: 450});

      act(() => button.focus());
      resize({width: 300, height: 800});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('ignores resizes below the threshold', function () {
      act(() => input.focus());
      resize({width: 300, height: 750});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('stays open on input-to-input focus', function () {
      let input2 = document.createElement('input');

      document.body.appendChild(input2);

      act(() => input.focus());
      resize({width: 300, height: 450});

      act(() => input2.focus());

      expect(isKeyboardOpen()).toBe(true);

      input2.remove();
    });

    it('stays open during focus marshalling', function () {
      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);

      act(() => jest.advanceTimersByTime(700));

      act(() => button.focus());
      resize({width: 300, height: 700});

      expect(isKeyboardOpen()).toBe(true);

      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);

      act(() => jest.advanceTimersByTime(700));

      expect(isKeyboardOpen()).toBe(true);
    });

    it('stays open when the content resizes', function () {
      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);

      act(() => jest.advanceTimersByTime(700));

      resize({width: 300, height: 700});

      expect(isKeyboardOpen()).toBe(true);

      act(() => jest.advanceTimersByTime(700));

      expect(isKeyboardOpen()).toBe(true);
    });

    it('stays open until the closing resize', function () {
      resize({width: 300, height: 400});
      act(() => input.focus());

      expect(isKeyboardOpen()).toBe(true);

      act(() => button.focus());

      expect(isKeyboardOpen()).toBe(true);

      act(() => jest.advanceTimersByTime(700));

      expect(isKeyboardOpen()).toBe(true);

      resize({width: 300, height: 800});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('supports orientation changes', function () {
      act(() => input.focus());
      resize({width: 800, height: 150});

      expect(isKeyboardOpen()).toBe(true);

      act(() => button.focus());
      resize({width: 800, height: 300});

      expect(isKeyboardOpen()).toBe(false);

      resize({width: 300, height: 800});

      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(isKeyboardOpen()).toBe(true);

      resize({width: 800, height: 150});

      expect(isKeyboardOpen()).toBe(true);

      act(() => button.focus());
      resize({width: 800, height: 300});

      expect(isKeyboardOpen()).toBe(false);
    });

    it('supports resizes before focus', function () {
      resize({width: 300, height: 400});
      act(() => input.focus());

      act(() => jest.advanceTimersByTime(700));

      expect(isKeyboardOpen()).toBe(true);
    });
  });

  describe('supportsKeyboard', function () {
    it('returns the default while a transition is pending', function () {
      act(() => input.focus());

      expect(supportsKeyboard()).toBe(true);
    });

    it('returns true when the keyboard opened in time', function () {
      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(supportsKeyboard()).toBe(true);
    });

    it('returns false when the keyboard did not open in time', function () {
      act(() => input.focus());
      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(false);
    });

    it('recovers when the keyboard opened in time', function () {
      act(() => input.focus());
      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(false);

      act(() => button.focus());
      act(() => input.focus());
      resize({width: 300, height: 450});

      act(() => button.focus());
      resize({width: 300, height: 800});

      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(true);
    });

    it('recovers when the keyboard opened before focus', function () {
      act(() => input.focus());
      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(false);

      act(() => button.focus());
      resize({width: 300, height: 450});
      act(() => input.focus());

      act(() => button.focus());
      resize({width: 300, height: 800});

      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(true);
    });

    it('does not consider non-text input types and non-inputs', function () {
      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(supportsKeyboard()).toBe(true);

      act(() => button.focus());
      resize({width: 300, height: 800});

      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(true);
    });

    it('returns false when the keyboard overlays the viewport', function () {
      let spy = jest.spyOn(window.navigator, 'userAgent', 'get');
      let meta = document.createElement('meta');

      meta.name = 'viewport';
      meta.content = 'interactive-widget=overlays-content';

      document.head.appendChild(meta);
      spy.mockReturnValue('Android');

      expect(supportsKeyboard()).toBe(false);

      spy.mockRestore();
      document.head.removeChild(meta);
    });

    it('does not change on input-to-input focus', function () {
      let input2 = document.createElement('input');

      document.body.appendChild(input2);

      act(() => input.focus());
      resize({width: 300, height: 450});

      expect(supportsKeyboard()).toBe(true);

      act(() => input2.focus());
      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(true);

      act(() => button.focus());
      resize({width: 300, height: 800});
      act(() => jest.advanceTimersByTime(700));

      expect(supportsKeyboard()).toBe(true);

      input2.remove();
    });
  });
});
