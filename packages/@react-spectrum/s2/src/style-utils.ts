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
import {fontRelative as internalFontRelative} from '../style/spectrum-theme';
import {StyleString} from '../style/types';

/**
 * Calculates vertical padding to center a single line of text within a container. Uses the CSS
 * `self()` function and `1lh` unit to compute the padding based on the container's minimum height
 * and border widths. This is useful for precise vertical centering without introducing a flex/grid
 * layout to the container.
 *
 * @example
 *   import {centerPadding, style} from '@react-spectrum/s2/style' with {type: 'macro'};
 *
 *   const styles = style({
 *     paddingY: centerPadding()
 *   });
 *
 * @param minHeight - A CSS expression for the minimum height to center within. Defaults to
 *   `'self(minHeight)'`.
 * @returns A CSS `calc()` expression wrapped as an arbitrary style value.
 */
export function centerPadding(minHeight: string = 'self(minHeight)'): `[${string}]` {
  return `[calc((${minHeight} - self(borderTopWidth, 0px) - self(borderBottomWidth, 0px) - 1lh) / 2)]`;
}

function fontRelative(base: number, baseFontSize = 14): `[${string}]` {
  return `[${internalFontRelative(base, baseFontSize)}]`;
}

export const field = () =>
  ({
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
        top: ['label', 'input', 'helptext'],
        side: ['label input', 'label helptext']
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
    columnGap: 12, // TODO: what token to use here? controlGap would be 6px for medium
    disableTapHighlight: true
  }) as const;

export const fieldLabel = () =>
  ({
    font: controlFont(),
    cursor: 'default',
    color: {
      default: 'neutral-subdued',
      isDisabled: 'disabled',
      isStaticColor: 'transparent-overlay-1000',
      forcedColors: 'ButtonText'
    }
  }) as const;

export const fieldInput = () =>
  ({
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
    containIntrinsicWidth:
      'calc(var(--defaultWidth) - self(paddingStart, 0px) - self(paddingEnd, 0px) - self(borderStartWidth, 0px) - self(borderEndWidth, 0px))'
  }) as const;

/**
 * Returns style properties that set the CSS `color-scheme` for a component. Defaults to the page's
 * color scheme and supports `'light'`, `'dark'`, and `'light dark'` values via the `colorScheme`
 * render prop condition. Intended for root containers (e.g. providers, modals, and popovers), and
 * not needed for individual components.
 *
 * @example
 *   import {setColorScheme, style} from '@react-spectrum/s2/style' with {type: 'macro'};
 *
 *   const styles = style({
 *     ...setColorScheme(),
 *     backgroundColor: 'layer-1'
 *   });
 */
export const setColorScheme = () =>
  ({
    '--s2-color-scheme': {
      type: 'colorScheme',
      value: {
        colorScheme: {
          'light dark': {
            default: 'light',
            '@media (prefers-color-scheme: dark)': 'dark'
          },
          light: 'light',
          dark: 'dark'
        }
      }
    },
    colorScheme: '--s2-color-scheme',
    // For backward compatibility in two cases:
    // 1. When a component compiled with an earlier version of S2 is embedded in a newer provider.
    // 2. When S2 CSS is compiled with lightningcss, setting color-scheme via a variable does not work.
    '--lightningcss-light': {
      type: 'transform', // arbitrary string
      value: {
        colorScheme: {
          'light dark': {
            default: 'initial',
            '@media (prefers-color-scheme: dark)': ' '
          },
          light: 'initial',
          dark: ' '
        }
      }
    },
    '--lightningcss-dark': {
      type: 'transform', // arbitrary string
      value: {
        colorScheme: {
          'light dark': {
            default: ' ',
            '@media (prefers-color-scheme: dark)': 'initial'
          },
          light: ' ',
          dark: 'initial'
        }
      }
    }
  }) as const;

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

export const controlFont = () =>
  ({
    default: 'ui',
    size: {
      XS: 'ui-xs',
      S: 'ui-sm',
      L: 'ui-lg',
      XL: 'ui-xl'
    }
  }) as const;

export const controlSize = (size: 'sm' | 'md' = 'md'): typeof controlSizeM | typeof controlSizeS =>
  size === 'sm' ? controlSizeS : controlSizeM;

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

// Base Gap - dynamic
export const controlGap = () =>
  ({
    default: 'base-gap-medium',
    size: {
      XS: 'base-gap-extra-small',
      S: 'base-gap-small',
      M: 'base-gap-medium',
      L: 'base-gap-large',
      XL: 'base-gap-extra-large'
    }
  }) as const;

// Accessory Gap - dynamic
export const accessoryGap = () =>
  ({
    default: 'accessory-gap-medium',
    size: {
      XS: 'accessory-gap-extra-small',
      S: 'accessory-gap-small',
      M: 'accessory-gap-medium',
      L: 'accessory-gap-large',
      XL: 'accessory-gap-extra-large',
      '2XL': 'accessory-gap-2x-large'
    }
  }) as const;

// Group Gap - dynamic
export const groupGap = () =>
  ({
    default: 'group-gap-medium',
    size: {
      default: 'group-gap-medium',
      XS: 'group-gap-extra-small',
      S: 'group-gap-small',
      M: 'group-gap-medium',
      L: 'group-gap-large',
      XL: 'group-gap-extra-large'
    },
    density: {
      default: {
        size: {
          default: 'group-gap-medium',
          XS: 'group-gap-extra-small',
          S: 'group-gap-small',
          M: 'group-gap-medium',
          L: 'group-gap-large',
          XL: 'group-gap-extra-large'
        }
      },
      compact: 'group-gap-compact',
      spacious: {
        size: {
          XS: 'group-gap-extra-small-spacious',
          S: 'group-gap-small-spacious',
          M: 'group-gap-medium-spacious',
          L: 'group-gap-large-spacious',
          XL: 'group-gap-extra-large-spacious'
        }
      }
    }
  }) as const;

export const containerGap = () =>
  ({
    default: 'container-gap-medium',
    size: {
      '2XS': 'container-gap-2x-extra-small',
      XS: 'container-gap-extra-small',
      S: 'container-gap-small',
      M: 'container-gap-medium',
      L: 'container-gap-large',
      XL: 'container-gap-extra-large',
      '2XL': 'container-gap-2x-large'
    }
  }) as const;

// Base Horizontal Padding - dynamic
export const controlPadding = () =>
  ({
    default: 'base-padding-horizontal-medium',
    size: {
      XS: 'base-padding-horizontal-extra-small',
      S: 'base-padding-horizontal-small',
      M: 'base-padding-horizontal-medium',
      L: 'base-padding-horizontal-large',
      XL: 'base-padding-horizontal-extra-large',
      '2XL': 'base-padding-horizontal-2x-large'
    }
  }) as const;

export const containerPadding = () =>
  ({
    default: 'container-padding',
    size: {
      '2XS': 'container-padding-2x-extra-small',
      XS: 'container-padding-extra-small',
      S: 'container-padding-small',
      M: 'container-padding-medium',
      L: 'container-padding-large',
      XL: 'container-padding-extra-large',
      '2XL': 'container-padding-2x-large',
      '3XL': 'container-padding-3x-large'
    }
  }) as const;

const verticalPaddingTokens = {
  XS: 'base-padding-vertical-extra-small',
  S: 'base-padding-vertical-small',
  M: 'base-padding-vertical-medium',
  L: 'base-padding-vertical-large',
  XL: 'base-padding-vertical-extra-large',
  '2XL': 'base-padding-vertical-2x-large'
} as const;

const horizontalPaddingTokens = {
  XS: 'base-padding-horizontal-extra-small',
  S: 'base-padding-horizontal-small',
  M: 'base-padding-horizontal-medium',
  L: 'base-padding-horizontal-large',
  XL: 'base-padding-horizontal-extra-large',
  '2XL': 'base-padding-horizontal-2x-large'
} as const;

// Base Vertical Padding - static
export const verticalPadding = (size: keyof typeof verticalPaddingTokens = 'M') =>
  verticalPaddingTokens[size];

// Base Horizontal Padding - static
export const horizontalPadding = (size: keyof typeof horizontalPaddingTokens = 'M') =>
  horizontalPaddingTokens[size];

export const banner = () =>
  ({
    paddingX: {
      density: {
        default: 'banner-padding-horizontal',
        compact: 'banner-padding-horizontal-compact'
      }
    },
    paddingY: 'banner-padding-vertical',
    gap: {
      orientation: {
        horizontal: 'banner-gap-horizontal',
        vertical: 'banner-gap-vertical'
      }
    }
  }) as const;

// This generates the border radius for t-shirt sizes using the
// Major Second logarithmic scale.
export const controlBorderRadius = (size: 'default' | 'sm' = 'default') =>
  ({
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
  }) as const;

interface ControlOptions {
  shape?: 'default' | 'pill';
  wrap?: boolean;
  icon?: boolean;
}

interface ControlResult {
  font: ReturnType<typeof controlFont>;
  boxSizing?: 'border-box';
  borderRadius?: 'pill' | `[${string}]`;
  minWidth?: ReturnType<typeof controlSize>;
  minHeight?: ReturnType<typeof controlSize>;
  height?: ReturnType<typeof controlSize>;
  display?: 'flex';
  alignItems?: 'center' | {default: 'baseline'; [iconOnly]: 'center'};
  columnGap?: ReturnType<typeof controlGap>;
  paddingX?:
    | 'pill'
    | ReturnType<typeof controlPadding>
    | {default: 'pill' | ReturnType<typeof controlPadding>; [iconOnly]: 0};
  paddingY?: 0 | `[${string}]`;
}

const iconOnly = ':has([slot=icon]):not(:has([data-rsp-slot=text]))';

/**
 * Common styles for a pill or round rect shaped container with text and icon slots.
 * The text can optionally wrap, aligning the icon with the first line of text.
 */
export function control(options: ControlOptions): ControlResult {
  let paddingX = controlPadding();
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
    result.columnGap = controlGap();
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

export const widthProperties = ['width', 'minWidth', 'maxWidth'] as const;

export const heightProperties = ['size', 'height', 'minHeight', 'maxHeight'] as const;

export const fontProperties = [
  'font',
  'fontFamily',
  'fontWeight',
  'lineHeight',
  'fontSize'
] as const;

export type StylesProp = StyleString<
  (typeof allowedOverrides)[number] | (typeof widthProperties)[number]
>;
export type StylesPropWithHeight = StyleString<
  | (typeof allowedOverrides)[number]
  | (typeof widthProperties)[number]
  | (typeof heightProperties)[number]
>;
export type StylesPropWithoutWidth = StyleString<(typeof allowedOverrides)[number]>;

export type StylesPropWithFont = StyleString<(typeof fontProperties)[number]>;
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

export interface StyleProps extends UnsafeStyles {
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StylesProp;
}

export function getAllowedOverrides({width = true, height = false, font = false} = {}): string[] {
  return (allowedOverrides as unknown as string[])
    .concat(width ? widthProperties : [])
    .concat(height ? heightProperties : [])
    .concat(font ? ['fontFamily', 'fontWeight', 'lineHeight', 'fontSize'] : []);
}
