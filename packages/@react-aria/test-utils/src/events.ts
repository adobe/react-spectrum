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
import {UserOpts} from './types';

export const DEFAULT_LONG_PRESS_TIME = 500;

/**
 * Simulates a "long press" event on a element.
 * @param opts - Options for the long press.
 * @param opts.element - Element to long press.
 * @param opts.advanceTimer - Function that when called advances the timers in your test suite by a specific amount of time(ms).
 * @param opts.pointeropts - Options to pass to the simulated event. Defaults to mouse. See https://testing-library.com/docs/dom-testing-library/api-events/#fireevent for more info.
 */
export async function triggerLongPress(opts: {element: HTMLElement, advanceTimer: (time?: number) => void | Promise<unknown>, pointerOpts?: Record<string, any>}) {
  // TODO: note that this only works if the code from installPointerEvent is called somewhere in the test BEFORE the
  // render. Perhaps we should rely on the user setting that up since I'm not sure there is a great way to set that up here in the
  // util before first render. Will need to document it well
  let {element, advanceTimer, pointerOpts = {}} = opts;
  let pointerType = pointerOpts.pointerType ?? 'mouse';
  let shouldFireCompatibilityEvents = fireEvent.pointerDown(element, {pointerType, ...pointerOpts});
  let shouldFocus = true;
  if (shouldFireCompatibilityEvents) {
    if (pointerType === 'touch') {
      shouldFocus = shouldFireCompatibilityEvents = fireEvent.touchStart(element, {targetTouches: [{identifier: pointerOpts.pointerId, clientX: pointerOpts.clientX, clientY: pointerOpts.clientY}]});
    } else if (pointerType === 'mouse') {
      shouldFocus = fireEvent.mouseDown(element, pointerOpts);
      if (shouldFocus) {
        act(() => element.focus());
      }
    }
  }
  await act(async () => await advanceTimer(DEFAULT_LONG_PRESS_TIME));
  fireEvent.pointerUp(element, {pointerType, ...pointerOpts});
  if (shouldFireCompatibilityEvents) {
    if (pointerType === 'touch') {
      shouldFocus = fireEvent.touchEnd(element, {targetTouches: [{identifier: pointerOpts.pointerId, clientX: pointerOpts.clientX, clientY: pointerOpts.clientY}]});
      shouldFocus = fireEvent.mouseDown(element, pointerOpts);
      if (shouldFocus) {
        act(() => element.focus());
      }
      fireEvent.mouseUp(element, pointerOpts);
    } else if (pointerType === 'mouse') {
      fireEvent.mouseUp(element, pointerOpts);
    }
  }
  fireEvent.click(element, {detail: 1, ...pointerOpts});
}


export async function pressElement(user, element: HTMLElement, interactionType: UserOpts['interactionType']) {
  if (interactionType === 'mouse') {
    await user.click(element);
  } else if (interactionType === 'keyboard') {
    // TODO: For the keyboard flow, I wonder if it would be reasonable to just do fireEvent directly on the obtained row node or if we should
    // stick to simulting an actual user's keyboard operations as closely as possible
    // There are problems when using this approach though, actions like trying to trigger the select all checkbox and stuff behave oddly.
    act(() => element.focus());
    await user.keyboard('[Space]');
  } else if (interactionType === 'touch') {
    await user.pointer({target: element, keys: '[TouchA]'});
  }
}
