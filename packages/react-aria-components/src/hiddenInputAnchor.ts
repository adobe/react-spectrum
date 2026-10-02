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

import {CSSProperties} from 'react';

/**
 * Custom property used to point the hidden native input of a component (e.g.
 * Checkbox, Radio) at an anchor name other than the component default. Custom
 * properties inherit, so one declaration on the component or any ancestor
 * reaches both the component's outer element and the input inside it.
 *
 * This is the override path for names declared outside of inline styles (for
 * example in a class name), since an inline declaration always wins over a
 * stylesheet rule for `anchor-name` itself.
 */
export const hiddenInputAnchorVar = '--react-aria-anchor-name';

interface AnchorStyleProps extends CSSProperties {
  anchorName?: string;
}

/**
 * Resolves the anchor name the hidden native input is tethered to. A consumer
 * `anchorName` in the component's `style` wins, otherwise the custom property
 * is read with the component default as its fallback.
 */
function getAnchorName(defaultAnchorName: string, style?: CSSProperties): string {
  let override = (style as AnchorStyleProps | undefined)?.anchorName;
  return override ?? `var(${hiddenInputAnchorVar}, ${defaultAnchorName})`;
}

/**
 * Declares a component's outer element as the anchor for its hidden native
 * input.
 *
 * The default name is per instance. Verified in Chrome 153: with several
 * elements sharing one `anchor-name`, every input resolved to the same anchor
 * and none covered its own component, since a name resolves to a single anchor.
 * `anchor-scope` would localize a shared name, but it shipped later than anchor
 * positioning itself (Chrome 131 vs 125), so a shared name would break in that
 * window.
 */
export function getAnchorStyles(defaultAnchorName: string, style?: CSSProperties): CSSProperties {
  return {
    anchorName: getAnchorName(defaultAnchorName, style)
  } as CSSProperties;
}

/**
 * Positions the hidden native input of a component (e.g. Checkbox, Radio) over
 * the component's outer element, so the screen reader focus indicator
 * (VoiceOver and NVDA draw the ring around the native input) matches the
 * visible component instead of collapsing to the 1x1px VisuallyHidden box.
 *
 * `position: fixed` is required. With `position: absolute` the input's
 * containing block is still inside VisuallyHidden and `anchor()` does not
 * resolve against the anchor: verified in Chrome 153, the used values fell back
 * to the wrapper (used `top` 0px, used `width` 145px, box 153x21). `fixed`
 * takes the input out of that containing-block chain so the anchor resolves by
 * name.
 *
 * The `inset` shorthand is used rather than `top`/`left` for the offsets,
 * because it is correct in RTL while routing `anchor(left)` through a logical
 * property mirrored the input to the wrong side (measured -208px in RTL).
 *
 * `inset` alone is not enough, though: `width` and `height` have to be set
 * explicitly. A checkbox or radio input is a replaced control with an intrinsic
 * size, and WebKit positions it from `inset` without stretching it. Verified in
 * WebKit 26: with `inset` alone the input stayed at its 12x12 intrinsic box and
 * covered none of the component, while adding `anchor-size` sized it exactly.
 * Chromium stretches the control from `inset` alone, so this only shows up on
 * WebKit.
 *
 * In browsers without CSS anchor positioning support these declarations are
 * inert and the input keeps the previous 1x1px VisuallyHidden behavior.
 */
export function getHiddenInputStyles(
  defaultAnchorName: string,
  style?: CSSProperties
): CSSProperties {
  return {
    position: 'fixed',
    margin: 0,
    inset: 'anchor(top) anchor(right) anchor(bottom) anchor(left)',
    width: 'anchor-size(width)',
    height: 'anchor-size(height)',
    positionAnchor: getAnchorName(defaultAnchorName, style)
  } as CSSProperties;
}
