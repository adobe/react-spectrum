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

import {DimensionValue} from '@react-types/shared';

const dimensions = {
  'size-0': 0,
  'size-10': 1,
  'size-25': 2,
  'size-40': 3,
  'size-50': 4,
  'size-65': 5,
  'size-75': 6,
  'size-85': 7,
  'size-100': 8,
  'size-115': 9,
  'size-125': 10,
  'size-130': 11,
  'size-150': 12,
  'size-160': 13,
  'size-175': 14,
  'size-200': 16,
  'size-225': 18,
  'size-250': 20,
  'size-275': 22,
  'size-300': 24,
  'size-325': 26,
  'size-350': 28,
  'size-400': 32,
  'size-450': 36,
  'size-500': 40,
  'size-550': 44,
  'size-600': 48,
  'size-675': 54,
  'size-700': 56,
  'size-800': 64,
  'size-900': 72,
  'size-1000': 80,
  'size-1200': 96,
  'size-1250': 100,
  'size-1600': 128,
  'size-1700': 136,
  'size-2000': 160,
  'size-2400': 192,
  'size-3000': 240,
  'size-3400': 272,
  'size-3600': 288,
  'size-4600': 368,
  'size-5000': 400,
  'size-6000': 480,
  'static-size-0': 0,
  'static-size-10': 1,
  'static-size-25': 2,
  'static-size-50': 4,
  'static-size-40': 3,
  'static-size-65': 5,
  'static-size-100': 8,
  'static-size-115': 9,
  'static-size-125': 10,
  'static-size-130': 11,
  'static-size-150': 12,
  'static-size-160': 13,
  'static-size-175': 14,
  'static-size-200': 16,
  'static-size-225': 18,
  'static-size-250': 20,
  'static-size-300': 24,
  'static-size-400': 32,
  'static-size-450': 36,
  'static-size-500': 40,
  'static-size-550': 44,
  'static-size-600': 48,
  'static-size-700': 56,
  'static-size-800': 64,
  'static-size-900': 72,
  'static-size-1000': 80,
  'static-size-1200': 96,
  'static-size-1700': 136,
  'static-size-2400': 192,
  'static-size-2600': 208,
  'static-size-3400': 272,
  'static-size-3600': 288,
  'static-size-4600': 368,
  'static-size-5000': 400,
  'static-size-6000': 480,
  'single-line-height': 32, // size-400
  'single-line-width': 192 // size-2400
};

const spacingValues = [
  0,
  4,
  8,
  12,
  16,
  20,
  24,
  28,
  32,
  36,
  40,
  44,
  48,
  56,
  64,
  80,
  96,
  112,
  128,
  144,
  160,
  176,
  192,
  208,
  224,
  240,
  256,
  288,
  320,
  384
];

const sizing = {
  'auto': 'auto',
  '100vh': 'screen',
  'min-content': 'min',
  'max-content': 'max',
  'fit-content': 'fit'
};

const UNIT_RE = /(%|px|em|rem|vw|vh|auto|cm|mm|in|pt|pc|ex|ch|rem|vmin|vmax|fr)$/;
const FUNC_RE = /^\s*\w+\(/;
// const SPECTRUM_VARIABLE_RE = /(static-)?size-\d+|single-line-(height|width)/g;
const SIZING_RE = /auto|100vh|min-content|max-content|fit-content/;

export function convertDimension(value: DimensionValue, type: 'size' | 'space' | 'px') {
  let pixelValue;
  if (typeof value === 'number') {
    pixelValue = value;
  } else if (UNIT_RE.test(value)) {
    if (value.endsWith('px')) {
      pixelValue = parseFloat(value);
    } else if (value === '100%') {
      return 'full';
    } else {
      return `[${value}]`;
    }
  } else if (FUNC_RE.test(value)) {
    // return value.replace(SPECTRUM_VARIABLE_RE, 'var(--spectrum-global-dimension-$&, var(--spectrum-alias-$&))');
    // TODO: handle calc
    return null;
  } else if (SIZING_RE.test(value)) {
    return sizing[value as keyof typeof sizing];
  } else {
    pixelValue = dimensions[value as keyof typeof dimensions];
  }

  if (pixelValue == null) {
    throw new Error('invalid dimension: ' + value);
  }

  if (type === 'px') {
    return `${pixelValue}px`;
  }

  if (type === 'size' || spacingValues.includes(pixelValue)) {
    return pixelValue;
  }

  // TODO: Convert to rems? Find nearest value?
  return `[${pixelValue}px]`;
}

export function convertGridTrack(value: DimensionValue, toPixels = false) {
  if (typeof value === 'string' && /^max-content|min-content|minmax|auto|fit-content|repeat|\d+fr/.test(value)) {
    return value;
  } else {
    return convertDimension(value, toPixels ? 'px' : 'space');
  }
}

export function convertUnsafeDimension(value: string | number, type: 'size' | 'space') {
  if (typeof value === 'number') {
    return convertDimension(value, type);
  }

  let m = value.match(/^var\(--spectrum-global-dimension-(static-)?size-(.*)\)$/);
  if (m) {
    return convertDimension(`${m[1] || ''}size-${m[2]}`, type);
  }

  return null;
}
