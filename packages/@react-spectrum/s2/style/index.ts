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

import {fontRelative as internalFontRelative, size as internalSize, space as internalSpace} from './spectrum-theme';
export {baseColor, edgeToText, lightDark, linearGradient, colorMix, style} from './spectrum-theme';
export type {StyleString} from './types';

// Wrap these functions in arbitrary value syntax when called from the outside.
export function size(px: number): `[${string}]` {
  return `[${internalSize(px)}]`;
}

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
