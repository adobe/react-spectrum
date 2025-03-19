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

import {getOwnerDocument, isIOS, runAfterTransition} from '@react-aria/utils';

// Safari on iOS starts selecting text on long press. The only way to avoid this, it seems,
// is to add user-select: none to the entire page. Adding it to the pressable element prevents
// that element from being selected, but nearby elements may still receive selection. We add
// user-select: none on touch start, and remove it again on touch end to prevent this.
// This must be implemented using global state to avoid race conditions between multiple elements.

// There are three possible states due to the delay before removing user-select: none after
// pointer up. The 'default' state always transitions to the 'disabled' state, which transitions
// to 'restoring'. The 'restoring' state can either transition back to 'disabled' or 'default'.

// For non-iOS devices, we apply user-select: none to the pressed element instead to avoid possible
// performance issues that arise from applying and removing user-select: none to the entire page
// (see https://github.com/adobe/react-spectrum/issues/1609).
type State = 'default' | 'disabled' | 'restoring';

// Note that state only matters here for iOS. Non-iOS gets user-select: none applied to the target element
// rather than at the document level so we just need to apply/remove user-select: none for each pressed element individually
let state: State = 'default';
let savedUserSelect = '';
let modifiedElementMap = new WeakMap<Element, string>();

export function disableTextSelection(target?: Element): void {
  if (isIOS()) {
    if (state === 'default') {

      const documentObject = getOwnerDocument(target);
      savedUserSelect = documentObject.documentElement.style.webkitUserSelect;
      documentObject.documentElement.style.webkitUserSelect = 'none';
    }

    state = 'disabled';
  } else if (target instanceof HTMLElement || target instanceof SVGElement) {
    // If not iOS, store the target's original user-select and change to user-select: none
    // Ignore state since it doesn't apply for non iOS
    let property = 'userSelect' in target.style ? 'userSelect' : 'webkitUserSelect';
    modifiedElementMap.set(target, target.style[property]);
    target.style[property] = 'none';
  }
}

export function restoreTextSelection(target?: Element): void {
  if (isIOS()) {
    // If the state is already default, there's nothing to do.
    // If it is restoring, then there's no need to queue a second restore.
    if (state !== 'disabled') {
      return;
    }

    state = 'restoring';

    // There appears to be a delay on iOS where selection still might occur
    // after pointer up, so wait a bit before removing user-select.
    setTimeout(() => {
      // Wait for any CSS transitions to complete so we don't recompute style
      // for the whole page in the middle of the animation and cause jank.
      runAfterTransition(() => {
        // Avoid race conditions
        if (state === 'restoring') {

          const documentObject = getOwnerDocument(target);
          if (documentObject.documentElement.style.webkitUserSelect === 'none') {
            documentObject.documentElement.style.webkitUserSelect = savedUserSelect || '';
          }

          savedUserSelect = '';
          state = 'default';
        }
      });
    }, 300);
  } else if (target instanceof HTMLElement || target instanceof SVGElement) {
    // If not iOS, restore the target's original user-select if any
    // Ignore state since it doesn't apply for non iOS
    if (target && modifiedElementMap.has(target)) {
      let targetOldUserSelect = modifiedElementMap.get(target) as string;
      let property = 'userSelect' in target.style ? 'userSelect' : 'webkitUserSelect';

      if (target.style[property] === 'none') {
        target.style[property] = targetOldUserSelect;
      }

      if (target.getAttribute('style') === '') {
        target.removeAttribute('style');
      }
      modifiedElementMap.delete(target);
    }
  }
}
