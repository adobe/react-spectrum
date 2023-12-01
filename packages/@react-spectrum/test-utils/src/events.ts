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

import {act, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// TODO: try to get rid of this in favor of user event
// Triggers a "touch" event on an element.
export function triggerTouch(element, opts = {}) {
  fireEvent.pointerDown(element, {pointerType: 'touch', ...opts});
  fireEvent.pointerUp(element, {pointerType: 'touch', ...opts});
}

// TODO: expose from aria testing package, and re-export from this package?
// Triggers a "longPress" event on an element.
export const DEFAULT_LONG_PRESS_TIME = 500;

export function triggerLongPress(element, opts = {}) {
  fireEvent.pointerDown(element, {pointerType: 'touch', ...opts});
  act(() => {
    jest.advanceTimersByTime(DEFAULT_LONG_PRESS_TIME);
  });
  fireEvent.pointerUp(element, {pointerType: 'touch', ...opts});
}


// TODO: expose from aria testing package, and re-export from this package?
/**
 * Must **not** be called inside an `act` callback!
 *
 * \@testing-library/user-event's `type` helper doesn't call `act` every keystroke.
 * But we want to run all event handles after every character.
 * @param el The input element to type into.
 * @param value The text.
 * @deprecated Use `user.keyboard` instead.
 */
export function typeText(el: HTMLElement, value: string, opts?: any) {
  let skipClick = document.activeElement === el;
  for (let char of value) {
    act(() => {
      userEvent.type(el, char, {skipClick, ...opts});
    });

    skipClick = true;
  }
}
