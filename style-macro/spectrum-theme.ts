import {createColorProperty, createMappedProperty, createTheme, createArbitraryProperty} from './style-macro.ts';
import type * as CSS from 'csstype';
import tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

function colorToken(token: typeof tokens['gray-25']) {
  return {
    default: token.sets.light.value,
    dark: token.sets.dark.value
  };
}

function weirdColorToken(token: typeof tokens['accent-background-color-default']) {
  return {
    default: token.sets.light.sets.light.value,
    dark: token.sets.dark.sets.dark.value
  };
}

function pxToRem(px: string) {
  return parseFloat(px) / 16 + 'rem';
}

function fontSizeToken(token: typeof tokens['font-size-100']) {
  return {
    default: pxToRem(token.sets.desktop.value),
    touch: pxToRem(token.sets.mobile.value)
  };
}

type ReplaceColor<S extends string> = S extends `${infer S}-color-${infer N}` ? `${S}-${N}` : S;

function colorScale<S extends string>(scale: S): Record<ReplaceColor<Extract<keyof typeof tokens, `${S}-${number}`>>, ReturnType<typeof colorToken>> {
  let res: any = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token.replace('-color', '')] = colorToken((tokens as any)[token]);
    }
  }
  return res;
}

function simpleColorScale<S extends string>(scale: S): Record<Extract<keyof typeof tokens, `${S}-${number}`>, string> {
  let res: any = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token] = (tokens as any)[token].value;
    }
  }
  return res;
}

const color = {
  transparent: 'transparent',
  black: 'black',
  white: 'white',

  ...colorScale('gray'),
  ...colorScale('blue'),
  ...colorScale('red'),
  ...colorScale('orange'),
  ...colorScale('yellow'),
  ...colorScale('chartreuse'),
  ...colorScale('celery'),
  ...colorScale('green'),
  ...colorScale('seafoam'),
  ...colorScale('cyan'),
  ...colorScale('indigo'),
  ...colorScale('purple'),
  ...colorScale('fuchsia'),
  ...colorScale('magenta'),
  ...colorScale('pink'),
  ...colorScale('turquoise'),
  ...colorScale('brown'),
  ...colorScale('silver'),
  ...colorScale('cinnamon'),

  ...colorScale('accent-color'),
  ...colorScale('informative-color'),
  ...colorScale('negative-color'),
  ...colorScale('notice-color'),
  ...colorScale('positive-color'),

  ...simpleColorScale('transparent-white'),
  ...simpleColorScale('transparent-black'),

  // High contrast mode.
  ButtonBorder: 'ButtonBorder',
  ButtonFace: 'ButtonFace',
  ButtonText: 'ButtonText',
  Field: 'Field',
  Highlight: 'Highlight',
  HighlightText: 'HighlightText',
  GrayText: 'GrayText',
  Mark: 'Mark'
};

export function baseColor(base: keyof typeof color) {
  let keys = Object.keys(color) as (keyof typeof color)[];
  let index = keys.indexOf(base);
  if (index === -1) {
    throw new Error('Invalid base color ' + base);
  }

  return {
    default: base,
    isHovered: keys[index + 1],
    isFocusVisible: keys[index + 1],
    isPressed: keys[index + 1]
  };
}

const baseSpacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem', // 2px - spacing-50
  1: '0.25rem', // 4px - spacing-75
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px - spacing-100
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px - spacing-200
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px - spacing-300
  4.5: '1.125rem', // 18px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px - spacing-400
  7: '1.75rem', // 28px
  8: '2rem', // 32px - spacing-500
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px - spacing-600
  11: '2.75rem', // 44px
  12: '3rem', // 48px - spacing-700
  14: '3.5rem', // 56px
  16: '4rem', // 64px - spacing-800
  20: '5rem', // 80px - spacing-900
  24: '6rem', // 96px - spacing-1000
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem'
};

const spacing = {
  ...baseSpacing,

  // font-size relative values
  'text-to-control': (10 / 14) + 'em',
  'text-to-visual': {
    default: (6 / 14) + 'em', // -> 5px, 5px, 6px, 7px, 8px
    touch: (8 / 17) + 'em' // -> 6px, 7px, 8px, 9px, 10px, should be 7px, 7px, 8px, 9px, 11px
  },
  'edge-to-text': 'calc(self(height, self(minHeight)) * 3 / 8)',
  'pill': 'calc(self(height, self(minHeight)) / 2)'
};

const scaledSpacing: {[key in keyof typeof baseSpacing]: {default: string, touch: string}} = 
  Object.fromEntries(Object.entries(baseSpacing).map(([k, v]) => 
    [k, {default: v, touch: parseFloat(v) * 1.25 + v.match(/[^0-9.]+/)![0]}])
  ) as any;

const sizing = {
  ...scaledSpacing,
  auto: 'auto',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '2/4': '50%',
  '3/4': '75%',
  '1/5': '20%',
  '2/5': '40%',
  '3/5': '60%',
  '4/5': '80%',
  '1/6': '16.666667%',
  '2/6': '33.333333%',
  '3/6': '50%',
  '4/6': '66.666667%',
  '5/6': '83.333333%',
  full: '100%',
  screen: '100vh',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',

  control: {
    default: scaledSpacing[8],
    size: {
      XS: scaledSpacing[5],
      S: scaledSpacing[6],
      L: scaledSpacing[10],
      XL: scaledSpacing[12]
    }
  },
  // With browser support for round() we could do this:
  // 'control-sm': `round(${16 / 14}em, 2px)`
  'control-sm': {
    default: scaledSpacing[4],
    size: {
      S: scaledSpacing[3.5],
      L: scaledSpacing[4.5],
      XL: scaledSpacing[5]
    }
  }
};

const margin = {
  ...spacing,
  auto: 'auto'
};

const inset = {
  ...baseSpacing,
  auto: 'auto',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '2/4': '50%',
  '3/4': '75%',
  full: '100%'
};

const borderWidth = {
  0: '0px',
  1: '1px', // border-width-100
  2: '2px', // border-width-200
  4: '4px' // border-width-400
};

const radius = {
  none: '0px',
  sm: '0.25rem', // 4px
  default: '0.5rem', // 8px
  lg: '0.625rem', // 10px
  xl: '1rem', // 16px
  full: '9999px',
  pill: 'calc(self(height, self(minHeight, 9999px)) / 2)',
  control: 8 / 14 + 'em', // automatic based on font size (e.g. t-shirt size logarithmic scale)
  'control-sm': 4 / 14 + 'em'
};

type GridTrack = 'none' | 'subgrid' | (string & {}) | GridTrackSize[];
type GridTrackSize = 'auto' | 'min-content' | 'max-content' | `${number}fr` | `minmax(${string}, ${string})` | keyof typeof baseSpacing;

let gridTrack = (value: GridTrack) => {
  if (typeof value === 'string') {
    return value;
  }
  return value.map(v => gridTrackSize(v)).join(' ');
};

let gridTrackSize = (value: GridTrackSize) => {
  // @ts-ignore
  return value in baseSpacing ? baseSpacing[value] : value;
};

// TODO
const transitionProperty = {
  default: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, scale, filter, backdrop-filter',
  colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform',
  all: 'all',
  none: 'none'
};

// TODO
const transitionTimingFunction = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
};

const colorWithAlpha = createColorProperty(color);

export const style = createTheme({
  properties: {
    // colors
    color: createColorProperty({
      ...color,
      accent: {
        ...colorToken(tokens['accent-content-color-default']),
        isHovered: colorToken(tokens['accent-content-color-hover']),
        isFocusVisible: colorToken(tokens['accent-content-color-key-focus']),
        isPressed: colorToken(tokens['accent-content-color-down'])
        // isSelected: colorToken(tokens['accent-content-color-selected']), // same as pressed
      },
      neutral: {
        ...colorToken(tokens['neutral-content-color-default']),
        isHovered: colorToken(tokens['neutral-content-color-hover']),
        isFocusVisible: colorToken(tokens['neutral-content-color-key-focus']),
        isPressed: colorToken(tokens['neutral-content-color-down'])
        // isSelected: colorToken(tokens['neutral-subdued-content-color-selected']),
      },
      'neutral-subdued': {
        ...colorToken(tokens['neutral-subdued-content-color-default']),
        isHovered: colorToken(tokens['neutral-subdued-content-color-hover']),
        isFocusVisible: colorToken(tokens['neutral-subdued-content-color-key-focus']),
        isPressed: colorToken(tokens['neutral-subdued-content-color-down'])
        // isSelected: colorToken(tokens['neutral-subdued-content-color-selected']),
      },
      negative: {
        ...colorToken(tokens['negative-content-color-default']),
        isHovered: colorToken(tokens['negative-content-color-hover']),
        isFocusVisible: colorToken(tokens['negative-content-color-key-focus']),
        isPressed: colorToken(tokens['negative-content-color-down'])
      },
      disabled: {
        ...colorToken(tokens['disabled-content-color'])
        // forcedColors: 'GrayText'
      }
    }),
    backgroundColor: createColorProperty({
      ...color,
      accent: {
        ...weirdColorToken(tokens['accent-background-color-default']),
        isHovered: weirdColorToken(tokens['accent-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['accent-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['accent-background-color-down'])
      },
      neutral: {
        ...colorToken(tokens['neutral-background-color-default']),
        isHovered: colorToken(tokens['neutral-background-color-hover']),
        isFocusVisible: colorToken(tokens['neutral-background-color-key-focus']),
        isPressed: colorToken(tokens['neutral-background-color-down'])
      },
      'neutral-subdued': {
        ...weirdColorToken(tokens['neutral-subdued-background-color-default']),
        isHovered: weirdColorToken(tokens['neutral-subdued-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['neutral-subdued-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['neutral-subdued-background-color-down'])
      },
      negative: {
        ...weirdColorToken(tokens['negative-background-color-default']),
        isHovered: weirdColorToken(tokens['negative-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['negative-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['negative-background-color-down'])
      },
      informative: {
        ...weirdColorToken(tokens['informative-background-color-default']),
        isHovered: weirdColorToken(tokens['informative-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['informative-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['informative-background-color-down'])
      },
      positive: {
        ...weirdColorToken(tokens['positive-background-color-default']),
        isHovered: weirdColorToken(tokens['positive-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['positive-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['positive-background-color-down'])
      },
      notice: weirdColorToken(tokens['notice-background-color-default']),
      gray: weirdColorToken(tokens['gray-background-color-default']),
      red: weirdColorToken(tokens['red-background-color-default']),
      orange: weirdColorToken(tokens['orange-background-color-default']),
      yellow: weirdColorToken(tokens['yellow-background-color-default']),
      chartreuse: weirdColorToken(tokens['chartreuse-background-color-default']),
      celery: weirdColorToken(tokens['celery-background-color-default']),
      green: weirdColorToken(tokens['green-background-color-default']),
      seafoam: weirdColorToken(tokens['seafoam-background-color-default']),
      cyan: weirdColorToken(tokens['cyan-background-color-default']),
      blue: weirdColorToken(tokens['blue-background-color-default']),
      indigo: weirdColorToken(tokens['indigo-background-color-default']),
      purple: weirdColorToken(tokens['purple-background-color-default']),
      fuchsia: weirdColorToken(tokens['fuchsia-background-color-default']),
      magenta: weirdColorToken(tokens['magenta-background-color-default']),
      disabled: {
        ...colorToken(tokens['disabled-background-color'])
        // forcedColors: 'GrayText'
      }
    }),
    borderColor: createColorProperty({
      ...color,
      negative: {
        ...colorToken(tokens['negative-border-color-default']),
        isHovered: colorToken(tokens['negative-border-color-hover']),
        isFocusVisible: colorToken(tokens['negative-border-color-key-focus']),
        isPressed: colorToken(tokens['negative-border-color-down'])
      },
      disabled: {
        ...colorToken(tokens['disabled-border-color'])
        // forcedColors: 'GrayText'
      }
    }),
    outlineColor: createColorProperty({
      ...color,
      'focus-ring': {
        ...colorToken(tokens['focus-indicator-color']),
        forcedColors: 'Highlight'
      }
    }),
    textDecorationColor: colorWithAlpha,
    accentColor: colorWithAlpha,
    caretColor: colorWithAlpha,
    fill: createColorProperty({
      none: 'none',
      currentColor: 'currentColor',
      ...color
    }),
    stroke: createColorProperty({
      none: 'none',
      currentColor: 'currentColor',
      ...color
    }),

    // dimensions
    borderSpacing: baseSpacing, // TODO: separate x and y
    flexBasis: {
      auto: 'auto',
      ...baseSpacing
    },
    rowGap: spacing,
    columnGap: spacing,
    height: sizing,
    width: sizing,
    minHeight: sizing,
    maxHeight: {
      ...sizing,
      none: 'none'
    },
    minWidth: sizing,
    maxWidth: {
      ...sizing,
      none: 'none'
    },
    borderWidth,
    borderStartWidth: createMappedProperty(value => ({borderInlineStartWidth: value}), borderWidth),
    borderEndWidth: createMappedProperty(value => ({borderInlineEndWidth: value}), borderWidth),
    borderTopWidth: borderWidth,
    borderBottomWidth: borderWidth,
    borderXWidth: createMappedProperty(value => ({borderInlineWidth: value}), borderWidth),
    borderYWidth: createMappedProperty(value => ({borderBlockWidth: value}), borderWidth),
    borderStyle: ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none'] as const,
    strokeWidth: {
      0: '0',
      1: '1',
      2: '2'
    },
    marginStart: createMappedProperty(value => ({marginInlineStart: value}), margin),
    marginEnd: createMappedProperty(value => ({marginInlineEnd: value}), margin),
    marginTop: margin,
    marginBottom: margin,
    paddingStart: createMappedProperty(value => ({paddingInlineStart: value}), spacing),
    paddingEnd: createMappedProperty(value => ({paddingInlineEnd: value}), spacing),
    paddingTop: spacing,
    paddingBottom: spacing,
    scrollMarginStart: createMappedProperty(value => ({scrollMarginInlineStart: value}), baseSpacing),
    scrollMarginEnd: createMappedProperty(value => ({scrollMarginInlineEnd: value}), baseSpacing),
    scrollMarginTop: baseSpacing,
    scrollMarginBottom: baseSpacing,
    scrollPaddingStart: createMappedProperty(value => ({scrollPaddingInlineStart: value}), baseSpacing),
    scrollPaddingEnd: createMappedProperty(value => ({scrollPaddingInlineEnd: value}), baseSpacing),
    scrollPaddingTop: baseSpacing,
    scrollPaddingBottom: baseSpacing,
    textIndent: baseSpacing,
    translate: {
      ...baseSpacing,
      '1/2': '50%',
      '1/3': '33.333333%',
      '2/3': '66.666667%',
      '1/4': '25%',
      '2/4': '50%',
      '3/4': '75%',
      full: '100%'
    },
    rotate: createArbitraryProperty((value: number | `${number}deg` | `${number}rad` | `${number}grad` | `${number}turn`) => ({rotate: typeof value === 'number' ? `${value}deg` : value})),
    scale: createArbitraryProperty((value: number) => ({scale: value})),
    transform: createArbitraryProperty((value: string) => ({transform: value})),
    position: ['absolute', 'fixed', 'relative', 'sticky', 'static'] as const,
    insetStart: createMappedProperty(value => ({insetInlineStart: value}), inset),
    insetEnd: createMappedProperty(value => ({insetInlineEnd: value}), inset),
    top: inset,
    left: inset,
    bottom: inset,
    right: inset,
    aspectRatio: {
      auto: 'auto',
      square: '1 / 1',
      video: '16 / 9'
    },

    // text
    fontFamily: {
      sans: 'adobe-clown, ui-sans-serif, system-ui, sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, Menlo, Monaco, Consalas, "Courier New", monospace'
    },
    fontSize: {
      xs: fontSizeToken(tokens['font-size-50']),
      sm: fontSizeToken(tokens['font-size-75']),
      base: fontSizeToken(tokens['font-size-100']),
      lg: fontSizeToken(tokens['font-size-200']),
      xl: fontSizeToken(tokens['font-size-300']),
      '2xl': fontSizeToken(tokens['font-size-400']),
      '3xl': fontSizeToken(tokens['font-size-500']),

      control: {
        default: fontSizeToken(tokens['font-size-100']),
        size: {
          XS: fontSizeToken(tokens['font-size-50']),
          S: fontSizeToken(tokens['font-size-75']),
          L: fontSizeToken(tokens['font-size-200']),
          XL: fontSizeToken(tokens['font-size-300'])
        }
      }
      // '3xl': '1.875rem', // 
      // '4xl': '2.25rem',
      // '5xl': '3rem',
      // '6xl': '3.75rem',
      // '7xl': '4.5rem',
      // '8xl': '6rem',
      // '9xl': '8rem'
      // 50: tokens['font-size-50'].sets.desktop.value,
      // 75: tokens['font-size-75'].sets.desktop.value,
      // 100: tokens['font-size-100'].sets.desktop.value,
      // 200: tokens['font-size-200'].sets.desktop.value,
      // 300: tokens['font-size-300'].sets.desktop.value,
      // 400: tokens['font-size-400'].sets.desktop.value,
      // 500: tokens['font-size-500'].sets.desktop.value,
      // 600: tokens['font-size-600'].sets.desktop.value,
      // 700: tokens['font-size-700'].sets.desktop.value,
      // 800: tokens['font-size-800'].sets.desktop.value,
      // 900: tokens['font-size-900'].sets.desktop.value,
      // 1000: tokens['font-size-1000'].sets.desktop.value,
      // 1100: tokens['font-size-1100'].sets.desktop.value,
      // 1200: tokens['font-size-1200'].sets.desktop.value,
      // 1300: tokens['font-size-1300'].sets.desktop.value,
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    fontStyle: ['normal', 'italic'] as const,
    lineHeight: {
      // TODO: naming
      100: tokens['line-height-100'].value,
      200: tokens['line-height-200'].value
    },
    listStyleType: ['none', 'dist', 'decimal'] as const,
    listStylePosition: ['inside', 'outside'] as const,
    textTransform: ['uppercase', 'lowercase', 'capitalize', 'none'] as const,
    textAlign: ['start', 'center', 'end', 'justify'] as const,
    verticalAlign: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'] as const,
    textDecoration: ['underline', 'overline', 'line-through', 'none'] as const,
    textOverflow: ['ellipsis', 'clip'] as const,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    truncate: createArbitraryProperty((_value: true) => ({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    })),
    lineClamp: createArbitraryProperty((value: number) => ({
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': value
    })),
    hyphens: ['none', 'manual', 'auto'] as const,
    whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'] as const,
    textWrap: ['wrap', 'nowrap', 'balance', 'pretty'] as const,
    wordBreak: ['normal', 'break-all', 'keep-all'] as const, // also overflowWrap??
    boxDecorationBreak: ['slice', 'clone'] as const,

    // effects
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none'
    },
    borderTopStartRadius: createMappedProperty(value => ({borderStartStartRadius: value}), radius),
    borderTopEndRadius: createMappedProperty(value => ({borderStartEndRadius: value}), radius),
    borderBottomStartRadius: createMappedProperty(value => ({borderEndStartRadius: value}), radius),
    borderBottomEndRadius: createMappedProperty(value => ({borderEndEndRadius: value}), radius),
    forcedColorAdjust: ['auto', 'none'] as const,
    backgroundPosition: ['bottom', 'center', 'left', 'left bottom', 'left top', 'right', 'right bottom', 'right top', 'top'] as const,
    backgroundSize: ['auto', 'cover', 'contain'] as const,
    backgroundAttachment: ['fixed', 'local', 'scroll'] as const,
    backgroundClip: ['border-box', 'padding-box', 'content-box', 'text'] as const,
    backgroundRepeat: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'round', 'space'] as const,
    backgroundOrigin: ['border-box', 'padding-box', 'content-box'] as const,
    backgroundBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'] as const,
    mixBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'plus-darker', 'plus-lighter'] as const,
    opacity: createArbitraryProperty((value: number) => ({opacity: value})),

    outlineStyle: ['none', 'solid', 'dashed', 'dotted', 'double'] as const,
    outlineOffset: borderWidth,
    outlineWidth: borderWidth,

    transition: createMappedProperty(value => ({
      transitionProperty: value,
      transitionDuration: '150ms',
      transitionTimingFunction: transitionTimingFunction.default
    }), transitionProperty),
    transitionDelay: {
      0: '0s',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    transitionDuration: {
      0: '0s',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    transitionTimingFunction,

    // layout
    display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents', 'list-item', 'none'] as const, // tables?
    alignContent: ['normal', 'center', 'start', 'end', 'space-between', 'space-around', 'space-evenly', 'baseline', 'stretch'] as const,
    alignItems: ['start', 'end', 'center', 'baseline', 'stretch'] as const,
    justifyContent: ['normal', 'start', 'end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch'] as const,
    justifyItems: ['start', 'end', 'center', 'stretch'] as const,
    alignSelf: ['auto', 'start', 'end', 'center', 'stretch', 'baseline'] as const,
    justifySelf: ['auto', 'start', 'end', 'center', 'stretch'] as const,
    flexDirection: ['row', 'column', 'row-reverse', 'column-reverse'] as const,
    flexWrap: ['wrap', 'wrap-reverse', 'nowrap'] as const,
    flex: createArbitraryProperty((value: CSS.Property.Flex) => ({flex: value})),
    flexShrink: createArbitraryProperty((value: CSS.Property.FlexShrink) => ({flexShrink: value})),
    flexGrow: createArbitraryProperty((value: CSS.Property.FlexGrow) => ({flexGrow: value})),
    gridColumn: createArbitraryProperty((value: CSS.Property.GridColumn) => ({gridColumn: value})),
    gridColumnStart: createArbitraryProperty((value: CSS.Property.GridColumnStart) => ({gridColumnStart: value})),
    gridColumnEnd: createArbitraryProperty((value: CSS.Property.GridColumnEnd) => ({gridColumnEnd: value})),
    gridRow: createArbitraryProperty((value: CSS.Property.GridRow) => ({gridRow: value})),
    gridRowStart: createArbitraryProperty((value: CSS.Property.GridRowStart) => ({gridRowStart: value})),
    gridRowEnd: createArbitraryProperty((value: CSS.Property.GridRowEnd) => ({gridRowEnd: value})),
    gridAutoFlow: ['row', 'column', 'dense', 'row dense', 'column dense'] as const,
    gridAutoRows: createArbitraryProperty((value: GridTrackSize) => ({gridAutoRows: gridTrackSize(value)})),
    gridAutoColumns: createArbitraryProperty((value: GridTrackSize) => ({gridAutoRows: gridTrackSize(value)})),
    gridTemplateColumns: createArbitraryProperty((value: GridTrack) => ({gridTemplateColumns: gridTrack(value)})),
    gridTemplateRows: createArbitraryProperty((value: GridTrack) => ({gridTemplateRows: gridTrack(value)})),
    float: ['inline-start', 'inline-end', 'right', 'left', 'none'] as const,
    clear: ['inline-start', 'inline-end', 'left', 'right', 'both', 'none'] as const,
    boxSizing: ['border-box', 'content-box'] as const,
    tableLayout: ['auto', 'fixed'] as const,
    captionSide: ['top', 'bottom'] as const,
    borderCollapse: ['collapse', 'separate'] as const,
    columns: {
      auto: 'auto',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
      '3xs': '16rem',
      '2xs': '18rem',
      xs: '20rem',
      sm: '24rem',
      md: '28rem',
      lg: '32rem',
      xl: '36rem',
      '2xl': '42rem',
      '3xl': '48rem',
      '4xl': '56rem',
      '5xl': '64rem',
      '6xl': '72rem',
      '7xl': '80rem'
    },
    breakBefore: ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'] as const,
    breakInside: ['auto', 'avoid', 'avoid-page', 'avoid-column'] as const,
    breakAfter: ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'] as const,
    overflowX: ['auto', 'hidden', 'clip', 'visible', 'scroll'] as const,
    overflowY: ['auto', 'hidden', 'clip', 'visible', 'scroll'] as const,
    overscrollBehaviorX: ['auto', 'contain', 'none'] as const,
    overscrollBehaviorY: ['auto', 'contain', 'none'] as const,
    scrollBehavior: ['auto', 'smooth'] as const,
    order: createArbitraryProperty((value: number) => ({order: value})),

    pointerEvents: ['none', 'auto'] as const,
    touchAction: ['auto', 'none', 'pan-x', 'pan-y', 'manipulation', 'pinch-zoom'] as const,
    userSelect: ['none', 'text', 'all', 'auto'] as const,
    visibility: ['visible', 'hidden', 'collapse'] as const,
    isolation: ['isolate', 'auto'] as const,
    transformOrigin: ['center', 'top', 'top right', 'right', 'bottom right', 'bottom', 'bottom left', 'left', 'top right'] as const,
    cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out'] as const,
    resize: ['none', 'vertical', 'horizontal', 'both'] as const,
    scrollSnapType: ['x', 'y', 'both', 'x mandatory', 'y mandatory', 'both mandatory'] as const,
    scrollSnapAlign: ['start', 'end', 'center', 'none'] as const,
    scrollSnapStop: ['normal', 'always'] as const,
    appearance: ['none', 'auto'] as const,
    objectFit: ['contain', 'cover', 'fill', 'none', 'scale-down'] as const,
    objectPosition: ['bottom', 'center', 'left', 'left bottom', 'left top', 'right', 'right bottom', 'right top', 'top'] as const,
    willChange: ['auto', 'scroll-position', 'contents', 'transform'] as const,
    zIndex: createArbitraryProperty((value: number) => ({zIndex: value}))
  },
  shorthands: {
    padding: ['paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd'] as const,
    paddingX: ['paddingStart', 'paddingEnd'] as const,
    paddingY: ['paddingTop', 'paddingBottom'] as const,
    margin: ['marginTop', 'marginBottom', 'marginStart', 'marginEnd'] as const,
    marginX: ['marginStart', 'marginEnd'] as const,
    marginY: ['marginTop', 'marginBottom'] as const,
    scrollPadding: ['scrollPaddingTop', 'scrollPaddingBottom', 'scrollPaddingStart', 'scrollPaddingEnd'] as const,
    scrollPaddingX: ['scrollPaddingStart', 'scrollPaddingEnd'] as const,
    scrollPaddingY: ['scrollPaddingTop', 'scrollPaddingBottom'] as const,
    scrollMargin: ['scrollMarginTop', 'scrollMarginBottom', 'scrollMarginStart', 'scrollMarginEnd'] as const,
    scrollMarginX: ['scrollMarginStart', 'scrollMarginEnd'] as const,
    scrollMarginY: ['scrollMarginTop', 'scrollMarginBottom'] as const,
    borderWidth: ['borderTopWidth', 'borderBottomWidth', 'borderStartWidth', 'borderEndWidth'] as const,
    borderXWidth: ['borderStartWidth', 'borderEndWidth'] as const,
    borderYWidth: ['borderTopWidth', 'borderBottomWidth'] as const,
    borderRadius: ['borderTopStartRadius', 'borderTopEndRadius', 'borderBottomStartRadius', 'borderBottomEndRadius'] as const,
    borderTopRadius: ['borderTopStartRadius', 'borderTopEndRadius'] as const,
    borderBottomRadius: ['borderBottomStartRadius', 'borderBottomEndRadius'] as const,
    borderStartRadius: ['borderTopStartRadius', 'borderBottomStartRadius'] as const,
    borderEndRadius: ['borderTopEndRadius', 'borderBottomEndRadius'] as const,
    insetX: ['insetStart', 'insetEnd'] as const,
    insetY: ['top', 'bottom'] as const,
    placeItems: ['alignItems', 'justifyItems'] as const,
    placeContent: ['alignContent', 'justifyContent'] as const,
    placeSelf: ['alignSelf', 'justifySelf'] as const,
    gap: ['rowGap', 'columnGap'] as const,
    size: ['width', 'height'] as const,
    overflow: ['overflowX', 'overflowY'] as const,
    overscrollBehavior: ['overscrollBehaviorX', 'overscrollBehaviorY'] as const
  },
  conditions: {
    dark: '@media (prefers-color-scheme: dark)',
    forcedColors: '@media (forced-colors: active)',
    // This detects touch primary devices as best as we can.
    // Ideally we'd use (pointer: course) but browser/device support is inconsistent.
    // Samsung Android devices claim to be mice at the hardware/OS level: (any-pointer: fine), (any-hover: hover), (hover: hover), and nothing for pointer.
    // More details: https://www.ctrl.blog/entry/css-media-hover-samsung.html
    // iPhone matches (any-hover: none), (hover: none), and nothing for any-pointer or pointer.
    // If a trackpad or Apple Pencil is connected to iPad, it matches (any-pointer: fine), (any-hover: hover), (hover: none).
    // Windows tablet matches the same as iPhone. No difference when a mouse is connected.
    // Windows touch laptop matches same as macOS: (any-pointer: fine), (pointer: fine), (any-hover: hover), (hover: hover).
    touch: '@media not ((hover: hover) and (pointer: fine))',
    // TODO
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)'
  }
});
