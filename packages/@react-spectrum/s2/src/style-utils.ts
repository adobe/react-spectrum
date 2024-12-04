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
import {StyleString} from '../style/types';

export function centerPadding(minHeight: string = 'self(minHeight)'): `[${string}]` {
  return `[calc((${minHeight} - self(borderTopWidth, 0px) - self(borderBottomWidth, 0px) - 1lh) / 2)]`;
}

export const field = () => ({
  display: 'grid',
  gridColumnStart: {
    isInForm: 1
  },
  gridColumnEnd: {
    isInForm: {
      labelPosition: {
        side: 'span 2'
      }
    }
  },
  gridTemplateColumns: {
    default: {
      labelPosition: {
        top: ['1fr'],
        side: ['auto', '1fr']
      }
    },
    isInForm: 'subgrid'
  },
  gridTemplateRows: {
    labelPosition: {
      top: ['auto', '1fr', 'auto'],
      side: ['auto', '1fr']
    }
  },
  gridTemplateAreas: {
    labelPosition: {
      top: [
        'label',
        'input',
        'helptext'
      ],
      side: [
        'label input',
        'label helptext'
      ]
    }
  },
  fontSize: 'control',
  alignItems: 'baseline',
  lineHeight: 'ui',
  '--field-height': {
    type: 'height',
    value: 'control'
  },
  // Spectrum defines the field label/help text with a (minimum) height, with text centered inside.
  // Calculate what the gap should be based on the height and line height.
  // Use a variable here rather than rowGap since it is applied to the children as padding.
  // This allows the gap to collapse when the label/help text is not present.
  // Eventually this may be possible to do in pure CSS: https://github.com/w3c/csswg-drafts/issues/5813
  '--field-gap': {
    type: 'rowGap',
    value: centerPadding('var(--field-height)')
  },
  columnGap: 12,
  disableTapHighlight: true
} as const);

export const fieldLabel = () => ({
  font: 'control',
  cursor: 'default',
  color: {
    default: 'neutral-subdued',
    isDisabled: 'disabled',
    isStaticColor: 'transparent-overlay-1000',
    forcedColors: 'ButtonText'
  }
} as const);

export const fieldInput = () => ({
  gridArea: 'input',
  minWidth: 'control',
  contain: {
    // Only apply size containment if contain-intrinsic-width is supported.
    // In older browsers, this will fall back to the default browser intrinsic width.
    '@supports (contain-intrinsic-width: 1px)': 'inline-size',
    isQuiet: 'none'
  },
  '--defaultWidth': {
    type: 'width',
    value: {
      default: 208,
      size: {
        S: 192,
        L: 224,
        XL: 240
      }
    }
  },
  // contain-intrinsic-width only includes the width of children, not the padding or borders.
  containIntrinsicWidth: '[calc(var(--defaultWidth) - self(paddingStart, 0px) - self(paddingEnd, 0px) - self(borderStartWidth, 0px) - self(borderEndWidth, 0px))]'
} as const);

export const colorScheme = () => ({
  colorScheme: {
    // Default to page color scheme if none is defined.
    default: '[var(--lightningcss-light, light) var(--lightningcss-dark, dark)]',
    colorScheme: {
      'light dark': 'light dark',
      light: 'light',
      dark: 'dark'
    }
  }
} as const);

export function staticColor() {
  return {
    '--s2-container-bg': {
      type: 'backgroundColor',
      value: {
        staticColor: {
          black: 'white',
          white: 'black'
        }
      }
    }
  } as const;
}

const allowedOverrides = [
  'margin',
  'marginStart',
  'marginEnd',
  'marginTop',
  'marginBottom',
  'marginX',
  'marginY',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'justifySelf',
  'alignSelf',
  'order',
  'gridArea',
  'gridRow',
  'gridRowStart',
  'gridRowEnd',
  'gridColumn',
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
  'insetEnd'
] as const;

const widthProperties = [
  'width',
  'minWidth',
  'maxWidth'
] as const;

const heightProperties = [
  'size',
  'height',
  'minHeight',
  'maxHeight'
] as const;

export type StylesProp = StyleString<(typeof allowedOverrides)[number] | (typeof widthProperties)[number]>;
export type StylesPropWithHeight = StyleString<(typeof allowedOverrides)[number] | (typeof widthProperties)[number] | (typeof heightProperties)[number]>;
export type StylesPropWithoutWidth = StyleString<(typeof allowedOverrides)[number]>;
export interface UnsafeStyles {
  /** Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. */
  UNSAFE_className?: string,
  /** Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. */
  UNSAFE_style?: CSSProperties
}

export interface StyleProps extends UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesProp
}

export function getAllowedOverrides({width = true, height = false} = {}) {
  return (allowedOverrides as unknown as string[]).concat(width ? widthProperties : []).concat(height ? heightProperties : []);
}
