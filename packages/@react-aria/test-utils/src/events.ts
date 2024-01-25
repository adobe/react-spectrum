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

import {act, fireEvent} from '@testing-library/react';

export const DEFAULT_LONG_PRESS_TIME = 500;

/**
 * Simulates a "long press" event on a element.
 * @param element - Element to long press.
 * @param opts - Options to pass to the simulated event. See https://testing-library.com/docs/dom-testing-library/api-events/#fireevent for more info.
 */
export function triggerLongPress(element: HTMLElement, opts = {}): void {
  fireEvent.pointerDown(element, {pointerType: 'touch', ...opts});
  act(() => {
    jest.advanceTimersByTime(DEFAULT_LONG_PRESS_TIME);
  });
  fireEvent.pointerUp(element, {pointerType: 'touch', ...opts});
}
