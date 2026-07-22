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
import {runAfterKeyboard, runAfterKeyboardTransition} from '../../src/utils/runAfterKeyboard';

jest.mock('../../src/utils/platform', () => ({
  ...jest.requireActual('../../src/utils/platform'),
  isWebKit: () => true
}));

describe('runAfterKeyboard', function () {
  let clock = Date.now();

  let width = window.innerWidth;
  let height = window.innerHeight;

  function openKeyboard(): void {
    let input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => {
        document.body.removeChild(input);
      })
    );
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

  describe('runAfterKeyboard', function () {
    it('flushes synchronously when akeyboard is unsupported', function () {
      let callback = jest.fn();

      openKeyboard();
      closeKeyboard();

      act(() => jest.advanceTimersByTime(700));

      runAfterKeyboard(callback);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('flushes after a frame when no keyboard change is expected', function () {
      let callback = jest.fn();

      openKeyboard();
      resize({width: 300, height: 450});

      closeKeyboard();
      resize({width: 300, height: 800});

      runAfterKeyboard(callback);

      expect(callback).not.toHaveBeenCalled();

      act(() => jest.runOnlyPendingTimers());

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('flushes after a frame when the keyboard is closing', function () {
      let callback = jest.fn();

      openKeyboard();
      resize({width: 300, height: 450});

      closeKeyboard();
      runAfterKeyboard(callback);

      act(() => jest.runOnlyPendingTimers());

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('flushes on resize end when the keyboard is opening', function () {
      let callback = jest.fn();

      openKeyboard();
      runAfterKeyboard(callback);

      act(() => jest.runOnlyPendingTimers());

      expect(callback).not.toHaveBeenCalled();

      resize({width: 300, height: 450});

      act(() => jest.advanceTimersByTime(100));

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('guarantees a flush when the keyboard did not open in time', function () {
      let callback = jest.fn();

      openKeyboard();
      runAfterKeyboard(callback);

      act(() => jest.runOnlyPendingTimers());
      act(() => jest.advanceTimersByTime(700));

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('does not flush when removed from the queue', function () {
      let callback = jest.fn();

      openKeyboard();
      runAfterKeyboard(callback)();

      act(() => jest.advanceTimersByTime(1000));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('runAfterKeyboardTransition', function () {
    it('flushes synchronously when a keyboard is unsupported', function () {
      let callback = jest.fn();

      openKeyboard();

      act(() => jest.advanceTimersByTime(700));

      runAfterKeyboardTransition(callback);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('flushes after a frame when no keyboard change is expected', function () {
      let callback = jest.fn();

      openKeyboard();
      resize({width: 300, height: 450});

      closeKeyboard();
      resize({width: 300, height: 800});

      runAfterKeyboardTransition(callback);

      expect(callback).not.toHaveBeenCalled();

      act(() => jest.runOnlyPendingTimers());

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('flushes on resize end when the keyboard is closing', function () {
      let callback = jest.fn();

      openKeyboard();
      resize({width: 300, height: 450});

      closeKeyboard();
      runAfterKeyboardTransition(callback);

      act(() => jest.runOnlyPendingTimers());

      resize({width: 300, height: 800});

      act(() => jest.advanceTimersByTime(100));

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('flushes on animation finish when the keyboard is opening', function () {
      let callback = jest.fn();

      openKeyboard();
      runAfterKeyboardTransition(callback);

      act(() => jest.runOnlyPendingTimers());

      resize({width: 300, height: 450});

      act(() => jest.advanceTimersByTime(50));

      expect(callback).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(250));

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('guarantees a flush when the keyboard did not open in time', function () {
      let callback = jest.fn();

      openKeyboard();
      runAfterKeyboard(callback);

      act(() => jest.runOnlyPendingTimers());
      act(() => jest.advanceTimersByTime(700));

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('guarantees a flush when the keyboard did not close in time', function () {
      let callback = jest.fn();

      openKeyboard();
      resize({width: 300, height: 450});

      closeKeyboard();
      runAfterKeyboardTransition(callback);

      act(() => jest.runOnlyPendingTimers());
      act(() => jest.advanceTimersByTime(700));

      expect(callback).toHaveBeenCalledWith(true);
    });

    it('does not flush when removed from the queue', function () {
      let callback = jest.fn();

      openKeyboard();
      runAfterKeyboardTransition(callback)();

      act(() => jest.advanceTimersByTime(1000));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
