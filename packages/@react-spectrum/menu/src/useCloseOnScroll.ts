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

import {RefObject} from '@react-types/shared';
import {useEffect} from 'react';

// This behavior moved from useOverlayTrigger to useOverlayPosition.
// For backward compatibility, where useOverlayTrigger handled hiding the popover on close,
// it sets a close function here mapped from the trigger element. This way we can avoid
// forcing users to pass an onClose function to useOverlayPosition which could be considered
// a breaking change.
export const onCloseMap: WeakMap<Element, () => void> = new WeakMap();

interface CloseOnScrollOptions {
  triggerRef: RefObject<Element | null>,
  isOpen?: boolean,
  onClose?: (() => void) | null
}

/** @private */
export function useCloseOnScroll(opts: CloseOnScrollOptions): void {
  let {triggerRef, isOpen, onClose} = opts;

  useEffect(() => {
    if (!isOpen || onClose === null) {
      return;
    }

    let onScroll = (e: Event) => {
      // Ignore if scrolling an scrollable region outside the trigger's tree.
      let target = e.target;
      // window is not a Node and doesn't have contain, but window contains everything
      if (!triggerRef.current || ((target instanceof Node) && !target.contains(triggerRef.current))) {
        return;
      }

      // Ignore scroll events on any input or textarea as the cursor position can cause it to scroll
      // such as in a combobox. Clicking the dropdown button places focus on the input, and if the
      // text inside the input extends beyond the 'end', then it will scroll so the cursor is visible at the end.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      let onCloseHandler = onClose || onCloseMap.get(triggerRef.current);
      if (onCloseHandler) {
        onCloseHandler();
      }
    };

    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, onClose, triggerRef]);
}
