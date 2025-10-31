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

import type * as CSS from 'csstype';
import {Inset, fontRelative as internalFontRelative, space as internalSpace, Spacing, style} from './spectrum-theme';
import type {MacroContext} from '@parcel/macros';
import {StyleString} from './types';

export {baseColor, color, edgeToText, lightDark, linearGradient, colorMix, size, style} from './spectrum-theme';
export type {StyleString} from './types';

// Wrap these functions in arbitrary value syntax when called from the outside.
export function space(px: number): `[${string}]` {
  return `[${internalSpace(px)}]`;
}

export function fontRelative(base: number, baseFontSize?: number): `[${string}]` {
  return `[${internalFontRelative(base, baseFontSize)}]`;
}

export const focusRing = () => ({
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineColor: 'focus-ring',
  outlineWidth: 2,
  outlineOffset: 2
} as const);

interface IconStyle {
  size?: 'XS' | 'S' | 'M' | 'L' |'XL',
  color?: 'white' | 'black' | 'accent' | 'neutral' | 'negative' | 'informative' | 'positive' | 'notice' | 'gray' | 'red' | 'orange' | 'yellow' | 'chartreuse' | 'celery' | 'green' | 'seafoam' | 'cyan' | 'blue' | 'indigo' | 'purple' | 'fuchsia' | 'magenta' | 'pink' | 'turquoise' | 'cinnamon' | 'brown' | 'silver',
  margin?: Spacing,
  marginStart?: Spacing,
  marginEnd?: Spacing,
  marginTop?: Spacing,
  marginBottom?: Spacing,
  marginX?: Spacing,
  marginY?: Spacing,
  alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline',
  justifySelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch',
  order?: number,
  gridArea?: CSS.Property.GridArea,
  gridColumnStart?: CSS.Property.GridColumnStart,
  gridColumnEnd?: CSS.Property.GridColumnEnd,
  gridRowStart?: CSS.Property.GridRowStart,
  gridRowEnd?: CSS.Property.GridRowStart,
  position?: 'absolute' | 'fixed' | 'relative' | 'sticky' | 'static',
  zIndex?: number,
  top?: Inset,
  bottom?: Inset,
  inset?: Inset,
  insetX?: Inset,
  insetY?: Inset,
  insetStart?: Inset,
  insetEnd?: Inset,
  rotate?: number | `${number}deg` | `${number}rad` | `${number}grad` | `${number}turn`
}

const iconSizes = {
  XS: 14,
  S: 16,
  M: 20,
  L: 22,
  XL: 26
} as const;

export function iconStyle(this: MacroContext | void, options: IconStyle): StyleString<Exclude<keyof IconStyle, 'color' | 'size'>> {
  let {size = 'M', color, ...styles} = options;

  if (color) {
    styles['--iconPrimary'] = {
      type: 'fill',
      value: color
    };
  }

  styles['size'] = iconSizes[size];

  // @ts-ignore
  return style.call(this, styles);
}
