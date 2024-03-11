import {createColorProperty, createMappedProperty, createTheme, createArbitraryProperty} from './style-macro';
import type * as CSS from 'csstype';
import tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

interface MacroContext {
  addAsset(asset: {type: string, content: string}): void
}

function colorToken(token: typeof tokens['gray-25']) {
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

function weirdColorToken(token: typeof tokens['accent-background-color-default']) {
  return `light-dark(${token.sets.light.sets.light.value}, ${token.sets.dark.sets.dark.value})`;
}

function pxToRem(px: string | number) {
  if (typeof px === 'string') {
    px = parseFloat(px);
  }
  return px / 16 + 'rem';
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
  Background: 'Background',
  ButtonBorder: 'ButtonBorder',
  ButtonFace: 'ButtonFace',
  ButtonText: 'ButtonText',
  Field: 'Field',
  Highlight: 'Highlight',
  HighlightText: 'HighlightText',
  GrayText: 'GrayText',
  Mark: 'Mark',
  LinkText: 'LinkText'
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

export function lightDark(light: keyof typeof color, dark: keyof typeof color): `[${string}]` {
  return `[light-dark(${color[light]}, ${color[dark]})]`;
}

function generateSpacing<K extends number[]>(px: K): {[P in K[number]]: string} {
  let res: any = {};
  for (let p of px) {
    res[p] = pxToRem(p);
  }
  return res;
}

const baseSpacing = generateSpacing([
  0,
  // 2, // spacing-50 !! TODO: should we support this?
  4, // spacing-75
  8, // spacing-100
  12, // spacing-200
  16, // spacing-300
  20,
  24, // spacing-400
  28,
  32, // spacing-500
  36,
  40, // spacing-600
  44,
  48, // spacing-700
  56,
  // From here onward the values are mostly spaced by 1rem (16px)
  64, // spacing-800
  80, // spacing-900
  96, // spacing-1000
  // TODO: should these only be available as sizes rather than spacing?
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
] as const);

// This should match the above, but negative. There's no way to negate a number
// type in typescript so this has to be done manually for now.
const negativeSpacing = generateSpacing([
  // -2, // spacing-50 !! TODO: should we support this?
  -4, // spacing-75
  -8, // spacing-100
  -12, // spacing-200
  -16, // spacing-300
  -20,
  -24, // spacing-400
  -28,
  -32, // spacing-500
  -36,
  -40, // spacing-600
  -44,
  -48, // spacing-700
  -56,
  // From here onward the values are mostly spaced by 1rem (16px)
  -64, // spacing-800
  -80, // spacing-900
  -96, // spacing-1000
  // TODO: should these only be available as sizes rather than spacing?
  -112,
  -128,
  -144,
  -160,
  -176,
  -192,
  -208,
  -224,
  -240,
  -256,
  -288,
  -320,
  -384
] as const);

function arbitrary(ctx: MacroContext | void, value: string): `[${string}]` {
  return ctx ? `[${value}]` : value as any;
}

export function fontRelative(this: MacroContext | void, base: number, baseFontSize = 14) {
  return arbitrary(this, (base / baseFontSize) + 'em');
}

export function edgeToText(this: MacroContext | void, height: keyof typeof baseSpacing) {
  return `calc(${baseSpacing[height]} * 3 / 8)`;
}

export function space(this: MacroContext | void, px: number) {
  return arbitrary(this, pxToRem(px));
}

const spacing = {
  ...baseSpacing,

  // font-size relative values
  'text-to-control': fontRelative(10),
  'text-to-visual': {
    default: fontRelative(6), // -> 5px, 5px, 6px, 7px, 8px
    touch: fontRelative(8, 17) // -> 6px, 7px, 8px, 9px, 10px, should be 7px, 7px, 8px, 9px, 11px
  },
  // height relative values
  'edge-to-text': 'calc(self(height, self(minHeight)) * 3 / 8)',
  'pill': 'calc(self(height, self(minHeight)) / 2)'
};

export function size(this: MacroContext | void, px: number) {
  return {default: arbitrary(this, pxToRem(px)), touch: arbitrary(this, pxToRem(px * 1.25))};
}

const scaledSpacing: {[key in keyof typeof baseSpacing]: {default: string, touch: string}} =
  Object.fromEntries(Object.entries(baseSpacing).map(([k, v]) =>
    [k, {default: v, touch: parseFloat(v) * 1.25 + v.match(/[^0-9.]+/)![0]}])
  ) as any;

const sizing = {
  ...scaledSpacing,
  auto: 'auto',
  full: '100%',
  screen: '100vh',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content',

  control: {
    default: size(32),
    size: {
      XS: size(20),
      S: size(24),
      L: size(40),
      XL: size(48)
    }
  },
  // With browser support for round() we could do this:
  // 'control-sm': `round(${16 / 14}em, 2px)`
  'control-sm': {
    default: size(16),
    size: {
      S: size(14),
      L: size(18),
      XL: size(20)
    }
  }
};

const margin = {
  ...spacing,
  ...negativeSpacing,
  auto: 'auto'
};

const inset = {
  ...baseSpacing,
  auto: 'auto',
  full: '100%'
};

const translate = {
  ...baseSpacing,
  ...negativeSpacing,
  full: '100%'
};

const borderWidth = {
  0: '0px',
  1: tokens['border-width-100'].value,
  2: tokens['border-width-200'].value,
  4: tokens['border-width-400'].value
};

const radius = {
  none: tokens['corner-radius-none'].value, // 0px
  sm: pxToRem(tokens['corner-radius-small-default'].value), // 4px
  default: pxToRem(tokens['corner-radius-medium-default'].value), // 8px
  lg: pxToRem(tokens['corner-radius-large-default'].value), // 10px
  xl: pxToRem(tokens['corner-radius-extra-large-default'].value), // 16px
  full: '9999px',
  pill: 'calc(self(height, self(minHeight, 9999px)) / 2)',
  control: fontRelative(8), // automatic based on font size (e.g. t-shirt size logarithmic scale)
  'control-sm': fontRelative(4)
};

type GridTrack = 'none' | 'subgrid' | (string & {}) | readonly GridTrackSize[];
type GridTrackSize = 'auto' | 'min-content' | 'max-content' | `${number}fr` | `minmax(${string}, ${string})` | keyof typeof baseSpacing | (string & {});

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

const transitionProperty = {
  default: 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter',
  colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  opacity: 'opacity',
  shadow: 'box-shadow',
  transform: 'transform, translate, scale, rotate',
  all: 'all',
  none: 'none'
};

// TODO
const timingFunction = {
  default: 'cubic-bezier(0.45, 0, 0.4, 1)',
  linear: 'linear',
  in: 'cubic-bezier(0.5, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.40, 1)',
  'in-out': 'cubic-bezier(0.45, 0, 0.4, 1)'
};

// TODO: do these need tokens or are arbitrary values ok?
let durationProperty = createArbitraryProperty((value: number | string, property) => ({[property]: typeof value === 'number' ? value + 'ms' : value}));

// const colorWithAlpha = createColorProperty(color);

const fontWeightBase = {
  light: '300',
  // TODO: spectrum calls this "regular" but CSS calls it "normal". We also call other properties "default". What do we want to match?
  normal: '400',
  medium: '500',
  bold: '700',
  'extra-bold': '800',
  black: '900'
} as const;

const i18nFonts = {
  ':lang(ar)': 'myriad-arabic, ui-sans-serif, system-ui, sans-serif',
  ':lang(he)': 'myriad-hebrew, ui-sans-serif, system-ui, sans-serif',
  ':lang(ja)': "adobe-clean-han-japanese, 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Osaka, YuGothic, 'Yu Gothic', 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif",
  ':lang(ko)': "adobe-clean-han-korean, source-han-korean, 'Malgun Gothic', 'Apple Gothic', sans-serif",
  ':lang(zh)': "adobe-clean-han-traditional, source-han-traditional, 'MingLiu', 'Heiti TC Light', sans-serif",
  // TODO: are these fallbacks supposed to be different than above?
  ':lang(zh-hant)': "adobe-clean-han-traditional, source-han-traditional, 'MingLiu', 'Microsoft JhengHei UI', 'Microsoft JhengHei', 'Heiti TC Light', sans-serif",
  ':lang(zh-Hans, zh-CN, zh-SG)': "adobe-clean-han-simplified-c, source-han-simplified-c, 'SimSun', 'Heiti SC Light', sans-serif"
} as const;

export const style = createTheme({
  properties: {
    // colors
    color: createColorProperty({
      ...color,
      accent: {
        default: colorToken(tokens['accent-content-color-default']),
        isHovered: colorToken(tokens['accent-content-color-hover']),
        isFocusVisible: colorToken(tokens['accent-content-color-key-focus']),
        isPressed: colorToken(tokens['accent-content-color-down'])
        // isSelected: colorToken(tokens['accent-content-color-selected']), // same as pressed
      },
      neutral: {
        default: colorToken(tokens['neutral-content-color-default']),
        isHovered: colorToken(tokens['neutral-content-color-hover']),
        isFocusVisible: colorToken(tokens['neutral-content-color-key-focus']),
        isPressed: colorToken(tokens['neutral-content-color-down'])
        // isSelected: colorToken(tokens['neutral-subdued-content-color-selected']),
      },
      'neutral-subdued': {
        default: colorToken(tokens['neutral-subdued-content-color-default']),
        isHovered: colorToken(tokens['neutral-subdued-content-color-hover']),
        isFocusVisible: colorToken(tokens['neutral-subdued-content-color-key-focus']),
        isPressed: colorToken(tokens['neutral-subdued-content-color-down'])
        // isSelected: colorToken(tokens['neutral-subdued-content-color-selected']),
      },
      negative: {
        default: colorToken(tokens['negative-content-color-default']),
        isHovered: colorToken(tokens['negative-content-color-hover']),
        isFocusVisible: colorToken(tokens['negative-content-color-key-focus']),
        isPressed: colorToken(tokens['negative-content-color-down'])
      },
      disabled: {
        default: colorToken(tokens['disabled-content-color'])
        // forcedColors: 'GrayText'
      },
      heading: colorToken(tokens['heading-color']),
      body: colorToken(tokens['body-color']),
      detail: colorToken(tokens['detail-color']),
      code: colorToken(tokens['code-color'])
    }),
    backgroundColor: createColorProperty({
      ...color,
      accent: {
        default: weirdColorToken(tokens['accent-background-color-default']),
        isHovered: weirdColorToken(tokens['accent-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['accent-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['accent-background-color-down'])
      },
      neutral: {
        default: colorToken(tokens['neutral-background-color-default']),
        isHovered: colorToken(tokens['neutral-background-color-hover']),
        isFocusVisible: colorToken(tokens['neutral-background-color-key-focus']),
        isPressed: colorToken(tokens['neutral-background-color-down'])
      },
      'neutral-subdued': {
        default: weirdColorToken(tokens['neutral-subdued-background-color-default']),
        isHovered: weirdColorToken(tokens['neutral-subdued-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['neutral-subdued-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['neutral-subdued-background-color-down'])
      },
      negative: {
        default: weirdColorToken(tokens['negative-background-color-default']),
        isHovered: weirdColorToken(tokens['negative-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['negative-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['negative-background-color-down'])
      },
      'negative-subdued': {
        default: colorToken(tokens['negative-subdued-background-color-default']),
        isHovered: colorToken(tokens['negative-subdued-background-color-hover']),
        isFocusVisible: colorToken(tokens['negative-subdued-background-color-key-focus']),
        isPressed: colorToken(tokens['negative-subdued-background-color-down'])
      },
      informative: {
        default: weirdColorToken(tokens['informative-background-color-default']),
        isHovered: weirdColorToken(tokens['informative-background-color-hover']),
        isFocusVisible: weirdColorToken(tokens['informative-background-color-key-focus']),
        isPressed: weirdColorToken(tokens['informative-background-color-down'])
      },
      positive: {
        default: weirdColorToken(tokens['positive-background-color-default']),
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
      pink: weirdColorToken(tokens['pink-background-color-default']),
      turquoise: weirdColorToken(tokens['turquoise-background-color-default']),
      cinnamon: weirdColorToken(tokens['cinnamon-background-color-default']),
      brown: weirdColorToken(tokens['brown-background-color-default']),
      silver: weirdColorToken(tokens['silver-background-color-default']),
      disabled: colorToken(tokens['disabled-background-color']),
      base: colorToken(tokens['background-base-color']),
      'layer-1': colorToken(tokens['background-layer-1-color']),
      'layer-2': weirdColorToken(tokens['background-layer-2-color']),
      pasteboard: weirdColorToken(tokens['background-pasteboard-color'])
    }),
    borderColor: createColorProperty({
      ...color,
      negative: {
        default: colorToken(tokens['negative-border-color-default']),
        isHovered: colorToken(tokens['negative-border-color-hover']),
        isFocusVisible: colorToken(tokens['negative-border-color-key-focus']),
        isPressed: colorToken(tokens['negative-border-color-down'])
      },
      disabled: colorToken(tokens['disabled-border-color'])
        // forcedColors: 'GrayText'

    }),
    outlineColor: createColorProperty({
      ...color,
      'focus-ring': {
        default: colorToken(tokens['focus-indicator-color']),
        forcedColors: 'Highlight'
      }
    }),
    // textDecorationColor: colorWithAlpha,
    // accentColor: colorWithAlpha,
    // caretColor: colorWithAlpha,
    fill: createColorProperty({
      none: 'none',
      currentColor: 'currentColor',
      accent: weirdColorToken(tokens['accent-visual-color']),
      neutral: weirdColorToken(tokens['neutral-visual-color']),
      negative: weirdColorToken(tokens['negative-visual-color']),
      informative: weirdColorToken(tokens['informative-visual-color']),
      positive: weirdColorToken(tokens['positive-visual-color']),
      notice: weirdColorToken(tokens['notice-visual-color']),
      gray: weirdColorToken(tokens['gray-visual-color']),
      red: weirdColorToken(tokens['red-visual-color']),
      orange: weirdColorToken(tokens['orange-visual-color']),
      yellow: weirdColorToken(tokens['yellow-visual-color']),
      chartreuse: weirdColorToken(tokens['chartreuse-visual-color']),
      celery: weirdColorToken(tokens['celery-visual-color']),
      green: weirdColorToken(tokens['green-visual-color']),
      seafoam: weirdColorToken(tokens['seafoam-visual-color']),
      cyan: weirdColorToken(tokens['cyan-visual-color']),
      blue: weirdColorToken(tokens['blue-visual-color']),
      indigo: weirdColorToken(tokens['indigo-visual-color']),
      purple: weirdColorToken(tokens['purple-visual-color']),
      fuchsia: weirdColorToken(tokens['fuchsia-visual-color']),
      magenta: weirdColorToken(tokens['magenta-visual-color']),
      pink: weirdColorToken(tokens['pink-visual-color']),
      turquoise: weirdColorToken(tokens['turquoise-visual-color']),
      cinnamon: weirdColorToken(tokens['cinnamon-visual-color']),
      brown: weirdColorToken(tokens['brown-visual-color']),
      silver: weirdColorToken(tokens['silver-visual-color']),
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
      full: '100%',
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
    borderStartWidth: createMappedProperty(value => ({borderInlineStartWidth: value}), borderWidth),
    borderEndWidth: createMappedProperty(value => ({borderInlineEndWidth: value}), borderWidth),
    borderTopWidth: borderWidth,
    borderBottomWidth: borderWidth,
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
    translateX: createMappedProperty(value => ({
      '--translateX': value,
      translate: 'var(--translateX, 0) var(--translateY, 0)'
    }), translate),
    translateY: createMappedProperty(value => ({
      '--translateY': value,
      translate: 'var(--translateX, 0) var(--translateY, 0)'
    }), translate),
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
      sans: {
        default: 'adobe-clown, adobe-clean, ui-sans-serif, system-ui, sans-serif',
        ...i18nFonts
      },
      serif: {
        default: 'adobe-clean-serif, "Source Serif", Georgia, serif',
        ...i18nFonts
      },
      code: 'source-code-pro, "Source Code Pro", Monaco, monospace'
    },
    fontSize: {
      // The default font size scale is for use within UI components.
      'ui-xs': fontSizeToken(tokens['font-size-50']),
      'ui-sm': fontSizeToken(tokens['font-size-75']),
      ui: fontSizeToken(tokens['font-size-100']),
      'ui-lg': fontSizeToken(tokens['font-size-200']),
      'ui-xl': fontSizeToken(tokens['font-size-300']),
      'ui-2xl': fontSizeToken(tokens['font-size-400']),
      'ui-3xl': fontSizeToken(tokens['font-size-500']),

      control: {
        default: fontSizeToken(tokens['font-size-100']),
        size: {
          XS: fontSizeToken(tokens['font-size-50']),
          S: fontSizeToken(tokens['font-size-75']),
          L: fontSizeToken(tokens['font-size-200']),
          XL: fontSizeToken(tokens['font-size-300'])
        }
      },

      'heading-xs': fontSizeToken(tokens['heading-size-xs']),
      'heading-sm': fontSizeToken(tokens['heading-size-s']),
      heading: fontSizeToken(tokens['heading-size-m']),
      'heading-lg': fontSizeToken(tokens['heading-size-l']),
      'heading-xl': fontSizeToken(tokens['heading-size-xl']),
      'heading-2xl': fontSizeToken(tokens['heading-size-xxl']),
      'heading-3xl': fontSizeToken(tokens['heading-size-xxxl']),

      // Body is for large blocks of text, e.g. paragraphs, not in UI components.
      'body-xs': fontSizeToken(tokens['body-size-xs']),
      'body-sm': fontSizeToken(tokens['body-size-s']),
      body: fontSizeToken(tokens['body-size-m']),
      'body-lg': fontSizeToken(tokens['body-size-l']),
      'body-xl': fontSizeToken(tokens['body-size-xl']),
      'body-2xl': fontSizeToken(tokens['body-size-xxl']),
      'body-3xl': fontSizeToken(tokens['body-size-xxxl']),

      'detail-sm': fontSizeToken(tokens['detail-size-s']),
      detail: fontSizeToken(tokens['detail-size-m']),
      'detail-lg': fontSizeToken(tokens['detail-size-l']),
      'detail-xl': fontSizeToken(tokens['detail-size-xl']),

      'code-xs': fontSizeToken(tokens['code-size-xs']),
      'code-sm': fontSizeToken(tokens['code-size-s']),
      code: fontSizeToken(tokens['code-size-m']),
      'code-lg': fontSizeToken(tokens['code-size-l']),
      'code-xl': fontSizeToken(tokens['code-size-xl'])
    },
    fontWeight: {
      ...fontWeightBase,
      heading: {
        default: fontWeightBase[tokens['heading-sans-serif-font-weight'].value as keyof typeof fontWeightBase],
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': fontWeightBase[tokens['heading-cjk-font-weight'].value as keyof typeof fontWeightBase]
      },
      detail: {
        default: fontWeightBase[tokens['detail-sans-serif-font-weight'].value as keyof typeof fontWeightBase],
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': fontWeightBase[tokens['detail-cjk-font-weight'].value as keyof typeof fontWeightBase]
      }
    },
    lineHeight: {
      // See https://spectrum.corp.adobe.com/page/typography/#Line-height
      ui: {
        default: tokens['line-height-100'].value,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': tokens['line-height-200'].value
      },
      heading: {
        default: tokens['heading-line-height'].value,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': tokens['heading-cjk-line-height'].value
      },
      body: {
        default: tokens['body-line-height'].value,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': tokens['body-cjk-line-height'].value
      },
      detail: {
        default: tokens['detail-line-height'].value,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': tokens['detail-cjk-line-height'].value
      },
      code: {
        default: tokens['code-line-height'].value,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans)': tokens['code-cjk-line-height'].value
      }
    },
    listStyleType: ['none', 'dist', 'decimal'] as const,
    listStylePosition: ['inside', 'outside'] as const,
    textTransform: ['uppercase', 'lowercase', 'capitalize', 'none'] as const,
    textAlign: ['start', 'center', 'end', 'justify'] as const,
    verticalAlign: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'] as const,
    textDecoration: createMappedProperty((value) => ({
      textDecoration: value === 'none' ? 'none' : `${value} ${tokens['text-underline-thickness'].value}`,
      textUnderlineOffset: value === 'underline' ? tokens['text-underline-gap'].value : undefined
    }), ['underline', 'overline', 'line-through', 'none'] as const),
    textOverflow: ['ellipsis', 'clip'] as const,
    lineClamp: createArbitraryProperty((value: number) => ({
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': value
    })),
    hyphens: ['none', 'manual', 'auto'] as const,
    whiteSpace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'] as const,
    textWrap: ['wrap', 'nowrap', 'balance', 'pretty'] as const,
    wordBreak: ['normal', 'break-all', 'keep-all'] as const, // also overflowWrap??
    boxDecorationBreak: ['slice', 'clone'] as const,

    // effects
    boxShadow: {
      'elevated-light': '0px 0px 3px 0px rgba(0, 0, 0, 0.12), 0px 3px 8px 0px rgba(0, 0, 0, 0.04), 0px 4px 16px 0px rgba(0, 0, 0, 0.08)',
      none: 'none'
    },
    filter: {
      'elevated-light': 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.12)) drop-shadow(0px 3px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0px 4px 16px rgba(0, 0, 0, 0.08))'
    },
    borderTopStartRadius: createMappedProperty(value => ({borderStartStartRadius: value}), radius),
    borderTopEndRadius: createMappedProperty(value => ({borderStartEndRadius: value}), radius),
    borderBottomStartRadius: createMappedProperty(value => ({borderEndStartRadius: value}), radius),
    borderBottomEndRadius: createMappedProperty(value => ({borderEndEndRadius: value}), radius),
    forcedColorAdjust: ['auto', 'none'] as const,
    colorScheme: ['light', 'dark', 'light dark'] as const,
    backgroundImage: createArbitraryProperty((value: string, property) => ({[property]: value})),
    // TODO: do we need separate x and y properties?
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

    transition: createMappedProperty((value, property) => ({[property === 'transition' ? 'transitionProperty' : property]: value}), transitionProperty),
    transitionDelay: durationProperty,
    transitionDuration: durationProperty,
    transitionTimingFunction: timingFunction,
    animation: createArbitraryProperty((value: string, property) => ({[property === 'animation' ? 'animationName' : property]: value})),
    animationDuration: durationProperty,
    animationDelay: durationProperty,
    animationDirection: ['normal', 'reverse', 'alternate', 'alternate-reverse'] as const,
    animationFillMode: ['none', 'forwards', 'backwards', 'both'] as const,
    animationIterationCount: createArbitraryProperty((value: string) => ({animationIterationCount: value})),
    animationTimingFunction: timingFunction,

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
    flexShrink: createArbitraryProperty((value: CSS.Property.FlexShrink, property) => ({[property]: value})),
    flexGrow: createArbitraryProperty((value: CSS.Property.FlexGrow, property) => ({[property]: value})),
    gridColumnStart: createArbitraryProperty((value: CSS.Property.GridColumnStart, property) => ({[property]: value})),
    gridColumnEnd: createArbitraryProperty((value: CSS.Property.GridColumnEnd, property) => ({[property]: value})),
    gridRowStart: createArbitraryProperty((value: CSS.Property.GridRowStart, property) => ({[property]: value})),
    gridRowEnd: createArbitraryProperty((value: CSS.Property.GridRowEnd, property) => ({[property]: value})),
    gridAutoFlow: ['row', 'column', 'dense', 'row dense', 'column dense'] as const,
    gridAutoRows: createArbitraryProperty((value: GridTrackSize, property) => ({[property]: gridTrackSize(value)})),
    gridAutoColumns: createArbitraryProperty((value: GridTrackSize, property) => ({[property]: gridTrackSize(value)})),
    gridTemplateColumns: createArbitraryProperty((value: GridTrack, property) => ({[property]: gridTrack(value)})),
    gridTemplateRows: createArbitraryProperty((value: GridTrack, property) => ({[property]: gridTrack(value)})),
    gridTemplateAreas: createArbitraryProperty((value: readonly string[], property) => ({[property]: value.map(v => `"${v}"`).join('')})),
    float: ['inline-start', 'inline-end', 'right', 'left', 'none'] as const,
    clear: ['inline-start', 'inline-end', 'left', 'right', 'both', 'none'] as const,
    contain: ['none', 'strict', 'content', 'size', 'inline-size', 'layout', 'style', 'paint'] as const,
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
      // TODO: what should these sizes be?
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
    translate: ['translateX', 'translateY'] as const,
    inset: ['top', 'bottom', 'left', 'right'] as const,
    insetX: ['insetStart', 'insetEnd'] as const,
    insetY: ['top', 'bottom'] as const,
    placeItems: ['alignItems', 'justifyItems'] as const,
    placeContent: ['alignContent', 'justifyContent'] as const,
    placeSelf: ['alignSelf', 'justifySelf'] as const,
    gap: ['rowGap', 'columnGap'] as const,
    size: ['width', 'height'] as const,
    overflow: ['overflowX', 'overflowY'] as const,
    overscrollBehavior: ['overscrollBehaviorX', 'overscrollBehaviorY'] as const,
    gridArea: ['gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd'] as const,
    transition: (value: keyof typeof transitionProperty) => ({
      transition: value,
      transitionDuration: 150,
      transitionTimingFunction: 'default'
    }),
    animation: (value: string) => ({
      animation: value,
      animationDuration: 150,
      animationTimingFunction: 'default'
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    truncate: (_value: true) => ({
      overflowX: 'hidden',
      overflowY: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    })
  },
  conditions: {
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
