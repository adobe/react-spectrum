/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {CSSProperties} from 'react';
export type StyleString<P = string> = string & {properties: P};

export type UnsafeClassName = string & {properties?: never};
export interface UnsafeStyles {
  /**
   * Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
   * for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop
   * instead.
   */
  UNSAFE_className?: UnsafeClassName;
  /**
   * Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the
   * element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead.
   */
  UNSAFE_style?: CSSProperties;
}

const allowedOverrides = [
  'margin',
  'marginStart',
  'marginEnd',
  'marginTop',
  'marginBottom',
  'marginX',
  'marginY',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'justifySelf',
  'alignSelf',
  'order',
  'gridArea',
  'gridRowStart',
  'gridRowEnd',
  'gridColumnStart',
  'gridColumnEnd',
  'position',
  'zIndex',
  'top',
  'bottom',
  'inset',
  'insetX',
  'insetY',
  'insetStart',
  'insetEnd',
  'visibility'
] as const;

export const widthProperties = ['width', 'minWidth', 'maxWidth'] as const;

export const heightProperties = ['size', 'height', 'minHeight', 'maxHeight'] as const;

export type StylesPropWithHeight = StyleString<
  | (typeof allowedOverrides)[number]
  | (typeof widthProperties)[number]
  | (typeof heightProperties)[number]
>;

export type StylesProp = StyleString<
  (typeof allowedOverrides)[number] | (typeof widthProperties)[number]
>;

export interface StyleProps extends UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesProp;
}
