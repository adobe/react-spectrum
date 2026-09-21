/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {RefObject} from '@react-types/shared';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';

let anchorSupport: boolean | null = null;
function getAnchorSupport(): boolean {
  if (anchorSupport === null) {
    anchorSupport =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('anchor-name: --test');
  }
  return anchorSupport ?? false;
}

/**
 * Positions the hidden native input of a component (e.g. Checkbox, Radio) over
 * the component's outer element using CSS anchor positioning, so the screen
 * reader focus indicator (VoiceOver and NVDA draw the ring around the native
 * input) matches the visible component instead of collapsing to the 1x1px
 * VisuallyHidden box.
 *
 * The input is taken out of flow with `position: fixed` and anchored to the
 * outer element with `position-anchor` + `anchor()`/`anchor-size()`, which
 * escapes the VisuallyHidden wrapper's 1x1px absolute box. If the outer
 * element (or a consumer-provided class) declares an `anchor-name`, that name
 * is used; otherwise a unique default name is applied inline. Browsers without
 * CSS anchor positioning support keep today's behavior.
 *
 * CSS can change without notifying React, so a later `anchor-name` change is
 * only picked up on re-render.
 */
export function useHiddenInputAnchor(
  anchorRef: RefObject<HTMLElement | null>,
  inputRef: RefObject<HTMLInputElement | null>,
  defaultAnchorName: string
): void {
  useLayoutEffect(() => {
    let outer = anchorRef.current;
    let input = inputRef.current;
    if (!outer || !input || !getAnchorSupport()) {
      return;
    }

    let name = getComputedStyle(outer).getPropertyValue('anchor-name').trim();
    if (!name || name === 'none') {
      name = defaultAnchorName;
      outer.style.setProperty('anchor-name', name);
    }

    input.style.setProperty('position', 'fixed');
    input.style.setProperty('margin', '0');
    input.style.setProperty('position-anchor', name);
    input.style.setProperty('top', 'anchor(top)');
    input.style.setProperty('left', 'anchor(left)');
    input.style.setProperty('width', 'anchor-size(width)');
    input.style.setProperty('height', 'anchor-size(height)');
  });
}
