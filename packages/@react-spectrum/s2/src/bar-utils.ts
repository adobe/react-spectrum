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

import {centerPadding, fieldInput, staticColor} from './style-utils' with {type: 'macro'};

export const bar = () => ({
  ...staticColor(),
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: {
    labelPosition: {
      top: ['1fr', 'auto'],
      side: ['auto', '1fr']
    }
  },
  gridTemplateAreas: {
    labelPosition: {
      top: [
        'label value',
        'bar bar'
      ],
      side: [
        'label bar value'
      ]
    }
  },
  alignItems: 'baseline',
  isolation: 'isolate',
  minWidth: 48, // progress-bar-minimum-width
  maxWidth: 768, // progress-bar-maximum-width
  '--field-height': {
    type: 'height',
    value: 'control'
  },
  '--track-to-label': {
    type: 'height',
    value: 4
  },
  // Spectrum defines the field label/help text with a (minimum) height, with text centered inside.
  // Calculate what the gap should be based on the height and line height.
  // Use a variable here rather than rowGap since it is applied to the children as padding.
  // This allows the gap to collapse when the label/help text is not present.
  // Eventually this may be possible to do in pure CSS: https://github.com/w3c/csswg-drafts/issues/5813
  '--field-gap': {
    type: 'rowGap',
    value: centerPadding('calc(var(--field-height) + var(--track-to-label))')
  },

  columnGap: 12 // spacing-200
} as const);

export const track = () => ({
  ...fieldInput(),
  gridArea: 'bar',
  overflow: 'hidden',
  borderRadius: 'full',
  backgroundColor: {
    default: 'gray-300',
    isStaticColor: 'transparent-overlay-300',
    forcedColors: 'ButtonFace'
  },
  outlineWidth: {
    default: 0,
    forcedColors: 1
  },
  outlineStyle: {
    default: 'none',
    forcedColors: 'solid'
  },
  outlineColor: {
    default: 'transparent',
    forcedColors: 'ButtonText'
  },
  zIndex: 1 // to fix a weird webkit bug with rounded corners and masking
} as const);
