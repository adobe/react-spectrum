/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
 * Anchor positioning styles for the hidden native input of a component (e.g.
 * Checkbox, Radio). Applied inline and unconditionally at render: in browsers
 * without CSS anchor positioning support these values are inert, and the input
 * keeps today's 1x1px VisuallyHidden behavior. The `position-anchor` value is
 * resolved by useHiddenInputAnchor instead, since it depends on the computed
 * `anchor-name` of the component's outer element.
 */
export const hiddenInputAnchorStyles = {
  position: 'fixed',
  margin: 0,
  top: 'anchor(top)',
  left: 'anchor(left)',
  width: 'anchor-size(width)',
  height: 'anchor-size(height)'
} as const;

/**
 * Resolves the anchor name used to position the hidden native input of a
 * component (e.g. Checkbox, Radio) over the component's outer element, so the
 * screen reader focus indicator (VoiceOver and NVDA draw the ring around the
 * native input) matches the visible component instead of collapsing to the
 * 1x1px VisuallyHidden box.
 *
 * If the outer element (or a consumer-provided class) declares an
 * `anchor-name`, that name is adopted; otherwise the component default is
 * applied inline. The input's positioning styles are applied at render, see
 * hiddenInputAnchorStyles. Browsers without CSS anchor positioning support
 * keep today's behavior.
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

    input.style.setProperty('position-anchor', name);
  });
}
