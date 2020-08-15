
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
import {LONG_PRESS_DEFAULT_THRESHOLD_IN_MS} from '@react-aria/interactions';

type pointerType = 'mouse' | 'touch'

export function triggerLongPress(button: HTMLElement, pointerType: pointerType) {
  act(() => {
    if (pointerType === 'touch') {
      fireEvent.touchStart(button, {targetTouches: [{}]});
      setTimeout(() => {
        fireEvent.touchEnd(button, {targetTouches: [{}]});
      }, LONG_PRESS_DEFAULT_THRESHOLD_IN_MS);
  
    } else {
      fireEvent.mouseDown(button, {detail: 1});
      setTimeout(() => {
        fireEvent.mouseUp(button, {detail: 1});
      }, LONG_PRESS_DEFAULT_THRESHOLD_IN_MS);
    }
  
    jest.advanceTimersByTime(LONG_PRESS_DEFAULT_THRESHOLD_IN_MS);
  
  });
}
