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

import {chain} from '@react-aria/utils';
import {PressEvent} from '@react-types/shared';
import {PressHookProps, PressResult, usePress} from './usePress';

// Safari does not focus buttons automatically when interacting with them, so we do it manually.
// See https://bugs.webkit.org/show_bug.cgi?id=22261
export function usePressableInput(props: PressHookProps): PressResult {
  let {onPressStart, onPressEnd, ...otherProps} = props;
  
  let focusOnPressStart = (e: PressEvent) => {
    e.target.focus();
  };

  let focusOnPressEnd = (e: PressEvent) => {
    // Ensure that focus did not move between press start and press end
    if (document.activeElement === document.body) {
      e.target.focus();
    }
  };

  return usePress({
    onPressStart: chain(onPressStart, focusOnPressStart),
    onPressEnd: chain(onPressEnd, focusOnPressEnd),
    ...otherProps
  });
}
