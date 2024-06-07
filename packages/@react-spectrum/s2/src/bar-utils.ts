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

import {centerPadding} from './style-utils' with {type: 'macro'};

export const bar = () => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gridTemplateAreas: [
    'label value',
    'bar bar'
  ],
  isolation: 'isolate',
  minWidth: 48, // progress-bar-minimum-width
  maxWidth: '[768px]', // progress-bar-maximum-width
  minHeight: 'control',
  '--field-gap': {
    type: 'rowGap',
    value: centerPadding()
  },
  columnGap: 12 // spacing-200
} as const);

export const track = () => ({
  gridArea: 'bar',
  overflow: 'hidden',
  marginTop: 4,
  borderRadius: 'full',
  backgroundColor: {
    default: 'gray-300',
    staticColor: {
      white: {
        default: 'transparent-white-100'
      },
      // TODO: Is there a black static color in S2?
      black: {
        default: 'transparent-black-400'
      }
    },
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
