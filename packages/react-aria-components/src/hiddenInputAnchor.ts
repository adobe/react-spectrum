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

// Override path for anchor names set outside of inline styles, e.g. in a class
// name, since an inline declaration wins for `anchor-name` itself.
export const hiddenInputAnchorVar = '--react-aria-anchor-name';

interface AnchorStyleProps extends CSSProperties {
  anchorName?: string;
}

function getAnchorName(defaultAnchorName: string, style?: CSSProperties): string {
  let override = (style as AnchorStyleProps | undefined)?.anchorName;
  return override ?? `var(${hiddenInputAnchorVar}, ${defaultAnchorName})`;
}

// Declares the component's outer element as the anchor. The name is per
// instance, since a name resolves to a single anchor.
export function getAnchorStyles(defaultAnchorName: string, style?: CSSProperties): CSSProperties {
  return {
    anchorName: getAnchorName(defaultAnchorName, style)
  } as CSSProperties;
}

// Positions the hidden input over the component, so the screen reader focus
// indicator matches the visible component instead of the 1x1px VisuallyHidden
// box. `fixed` escapes VisuallyHidden's containing block, `inset` keeps RTL
// correct, and `anchor-size` is needed because WebKit doesn't stretch the input
// from `inset` alone. Inert without anchor positioning support.
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
