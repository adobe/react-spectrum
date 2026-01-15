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
import {fontRelative} from '../style';
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
  fontSize: controlFont(),
  alignItems: 'baseline',
  lineHeight: 'ui',
  '--field-height': {
    type: 'height',
    value: controlSize()
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
  font: controlFont(),
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
  minWidth: controlSize(),
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
  containIntrinsicWidth: 'calc(var(--defaultWidth) - self(paddingStart, 0px) - self(paddingEnd, 0px) - self(borderStartWidth, 0px) - self(borderEndWidth, 0px))'
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

export function staticColor(): Record<string, any> {
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

export const controlFont = () => ({
  default: 'ui',
  size: {
    XS: 'ui-xs',
    S: 'ui-sm',
    L: 'ui-lg',
    XL: 'ui-xl'
  }
} as const);

export const controlSize = (size: 'sm' | 'md' = 'md'): typeof controlSizeM | typeof controlSizeS => (
  size === 'sm' ? controlSizeS : controlSizeM
);

const controlSizeM = {
  default: 32,
  size: {
    XS: 20,
    S: 24,
    L: 40,
    XL: 48
  }
} as const;

const controlSizeS = {
  default: 16,
  size: {
    S: 14,
    L: 18,
    XL: 20
  }
} as const;

// This generates the border radius for t-shirt sizes using the
// Major Second logarithmic scale.
export const controlBorderRadius = (size: 'default' | 'sm' = 'default') => ({
  '--size': {
    type: 'order',
    value: {
      default: 1,
      size: {
        XS: Math.pow(1.125, -2),
        S: Math.pow(1.125, -1),
        L: Math.pow(1.125, 1),
        XL: Math.pow(1.125, 2)
      }
    }
  },
  '--radius': {
    type: 'borderTopStartRadius',
    value: size
  },
  borderRadius: 'round(var(--radius) * var(--size), 1px)'
} as const);

interface ControlOptions {
  shape?: 'default' | 'pill',
  wrap?: boolean,
  icon?: boolean
}

interface ControlResult {
  font: ReturnType<typeof controlFont>,
  boxSizing?: 'border-box',
  borderRadius?: 'pill' | `[${string}]`,
  minWidth?: ReturnType<typeof controlSize>,
  minHeight?: ReturnType<typeof controlSize>,
  height?: ReturnType<typeof controlSize>,
  display?: 'flex',
  alignItems?: 'center' | {default: 'baseline', [iconOnly]: 'center'},
  columnGap?: 'text-to-visual',
  paddingX?: 'pill' | 'edge-to-text' | {default: 'pill' | 'edge-to-text', [iconOnly]: 0},
  paddingY?: 0 | `[${string}]`
}

const iconOnly = ':has([slot=icon]):not(:has([data-rsp-slot=text]))';

/**
 * Common styles for a pill or round rect shaped container with text and icon slots.
 * The text can optionally wrap, aligning the icon with the first line of text.
 */
export function control(options: ControlOptions): ControlResult {
  let paddingX = options.shape === 'pill' ? 'pill' as const : 'edge-to-text' as const;
  let result: ControlResult = {
    font: controlFont(),
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingX: paddingX,
    minWidth: controlSize()
  };

  if (options.shape === 'pill') {
    result.borderRadius = 'pill';
  } else {
    Object.assign(result, controlBorderRadius());
  }

  if (options.icon) {
    result.columnGap = 'text-to-visual';
    result.paddingX = {
      default: paddingX,
      [iconOnly]: 0
    };
    result['--iconMargin'] = {
      type: 'marginStart',
      value: {
        default: fontRelative(-2),
        [iconOnly]: 0
      }
    };
  }

  if (options.wrap) {
    result.minHeight = controlSize();

    if (options.icon) {
      result.paddingY = 0;
      result['--labelPadding'] = {
        type: 'paddingTop',
        value: centerPadding()
      };
      result.alignItems = {
        default: 'baseline',
        [iconOnly]: 'center'
      };
    } else {
      result.paddingY = centerPadding();
    }
  } else {
    result.height = controlSize();
  }

  return result;
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

export const widthProperties = [
  'width',
  'minWidth',
  'maxWidth'
] as const;

export const heightProperties = [
  'size',
  'height',
  'minHeight',
  'maxHeight'
] as const;

export type StylesProp = StyleString<(typeof allowedOverrides)[number] | (typeof widthProperties)[number]>;
export type StylesPropWithHeight = StyleString<(typeof allowedOverrides)[number] | (typeof widthProperties)[number] | (typeof heightProperties)[number]>;
export type StylesPropWithoutWidth = StyleString<(typeof allowedOverrides)[number]>;
export type UnsafeClassName = string & {properties?: never};
export interface UnsafeStyles {
  /** Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. */
  UNSAFE_className?: UnsafeClassName,
  /** Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. */
  UNSAFE_style?: CSSProperties
}

export interface StyleProps extends UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesProp
}

export function getAllowedOverrides({width = true, height = false} = {}): string[] {
  return (allowedOverrides as unknown as string[]).concat(width ? widthProperties : []).concat(height ? heightProperties : []);
}
