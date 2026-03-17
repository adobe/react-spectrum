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

import {ArbitraryProperty, Color, createTheme, ExpandedProperty, MappedProperty, parseArbitraryValue, PercentageProperty, SizingProperty} from './style-macro';
import {ArbitraryValue, CSSProperties, CSSValue, PropertyValueDefinition, PropertyValueMap, Value} from './types';
import {autoStaticColor, ColorRef, colorScale, ColorToken, colorToken, fontSizeToken, generateOverlayColorScale, getToken, shadowToken, simpleColorScale, weirdColorToken} from './tokens' with {type: 'macro'};
import type * as CSS from 'csstype';

interface MacroContext {
  addAsset(asset: {type: string, content: string}): void
}

function pxToRem(px: string | number) {
  if (typeof px === 'string') {
    px = parseFloat(px);
  }

  // In the docs, we need to be able to simulate font size adjustment.
  if (process.env.DOCS_ENV) {
    return `calc(${px / 16} * var(--rem, 1rem))`;
  }

  return px / 16 + 'rem';
}

function hcmColor(color: string) {
  // In the docs, HCM colors can be simulated.
  if (process.env.DOCS_ENV) {
    return `var(--hcm-${color.toLowerCase()}, ${color})`;
  }

  return color;
}

const baseColors = {
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
  ...generateOverlayColorScale(),

  // High contrast mode.
  // In the docs these can be simulated via variables.
  Background: hcmColor('Background'),
  ButtonBorder: hcmColor('ButtonBorder'),
  ButtonFace: hcmColor('ButtonFace'),
  ButtonText: hcmColor('ButtonText'),
  Field: hcmColor('Field'),
  Highlight: hcmColor('Highlight'),
  HighlightText: hcmColor('HighlightText'),
  GrayText: hcmColor('GrayText'),
  Mark: hcmColor('Mark'),
  LinkText: hcmColor('LinkText')
};

// Resolves a color to its most basic form, following all aliases.
function resolveColorToken(token: string | ColorToken | ColorRef): ColorToken {
  if (typeof token === 'string') {
    return {
      type: 'color',
      light: token,
      dark: token
    };
  }

  if (token.type === 'color') {
    return token;
  }

  let lightToken = baseColors[token.light];
  if (!lightToken) {
    throw new Error(`${token.light} is not a valid color reference`);
  }
  let darkToken = baseColors[token.dark];
  if (!darkToken) {
    throw new Error(`${token.dark} is not a valid color reference`);
  }

  let light = resolveColorToken(lightToken);
  let dark = resolveColorToken(darkToken);
  return {
    type: 'color',
    light: light.light,
    dark: dark.dark
  };
}

function colorTokenToString(token: ColorToken, opacity?: string | number) {
  let result = token.light === token.dark ? token.light : `light-dark(${token.light}, ${token.dark})`;
  if (opacity) {
    result = `rgb(from ${result} r g b / ${opacity}%)`;
  }
  return result;
}

// Bumps up a color token by one stop, e.g. for hover/press states.
let colorList = Object.keys(baseColors);
function nextColorStop(name: string, token: string | ColorToken | ColorRef): ColorToken {
  if (typeof token === 'object' && token.type === 'ref') {
    let light = nextColorStop(token.light, baseColors[token.light]);
    let dark = nextColorStop(token.dark, baseColors[token.dark]);

    return {
      type: 'color',
      light: light.light,
      dark: dark.dark,
      forcedColors: token.forcedColors
    };
  }

  let index = colorList.indexOf(name);
  if (index === -1) {
    throw new Error(`${name} does not support states`);
  }

  let key = colorList[index + 1];
  if (key.split('-')[0] !== name.split('-')[0]) {
    throw new Error(`${name} does not support states`);
  }

  return resolveColorToken(baseColors[key]);
}

class SpectrumColorProperty<C extends string> extends ArbitraryProperty<C> {
  mapping: {[name in C]: string | ColorToken | ColorRef};

  constructor(property: string, mapping: {[name in C]: string | ColorToken | ColorRef}) {
    super(property);
    this.mapping = mapping;
  }

  toCSSValue(value: Color<C>): PropertyValueDefinition<Value> {
    let [colorWithOpacity, state] = value.split(':');
    let [color, opacity] = colorWithOpacity.split('/');
    let token: string | ColorToken | ColorRef = this.mapping[color];
    if (!token) {
      throw new Error('Invalid color ' + value);
    }

    if (state === 'hovered' || state === 'pressed' || state === 'focused') {
      token = nextColorStop(color, token);
    } else {
      token = resolveColorToken(token);
    }

    let result = colorTokenToString(token, opacity);
    if (token.forcedColors) {
      return {
        default: result,
        forcedColors: token.forcedColors
      };
    }

    return result;
  }
}

type BaseColor = keyof typeof baseColors;

export function baseColor<C extends string = BaseColor>(base: BaseColor | C): {default: C, isHovered: C, isFocusVisible: C, isPressed: C} {
  return {
    default: base as C,
    isHovered: `${base}:hovered` as C,
    isFocusVisible: `${base}:focused` as C,
    isPressed: `${base}:pressed` as C
  };
}

type SpectrumColor = Color<BaseColor> | ArbitraryValue;
export function color(value: SpectrumColor): string {
  let arbitrary = parseArbitraryValue(value);
  if (arbitrary) {
    return arbitrary;
  }
  let [colorValue, opacity] = value.split('/');
  return colorTokenToString(resolveColorToken(baseColors[colorValue]), opacity);
}

export function lightDark(light: SpectrumColor, dark: SpectrumColor): `[${string}]` {
  return `[light-dark(${color(light)}, ${color(dark)})]`;
}

export function colorMix(a: SpectrumColor, b: SpectrumColor, percent: number): `[${string}]` {
  return `[color-mix(in srgb, ${color(a)}, ${color(b)} ${percent}%)]`;
}

interface LinearGradient {
  type: 'linear-gradient',
  angle: string,
  stops: [SpectrumColor, number][]
}

export function linearGradient(this: MacroContext | void, angle: string, ...tokens: [SpectrumColor, number][]): [LinearGradient] {
  // Generate @property rules for each gradient stop color. This allows the gradient to be animated.
  let propertyDefinitions: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    propertyDefinitions.push(`@property --g${i} {
  syntax: '<color>';
  initial-value: #0000;
  inherits: false;
}`);
  }

  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: propertyDefinitions.join('\n\n')
    });
  }

  return [{
    type: 'linear-gradient',
    angle,
    stops: tokens
  }];
}

// Spacing uses rems, padding does not.
function generateSpacing<K extends number[]>(px: K): {spacing: {[P in K[number]]: string}, padding: {[P in K[number]]: string}} {
  let spacing: any = {};
  let padding: any = {};
  for (let p of px) {
    spacing[p] = pxToRem(p);
    padding[p] = p + 'px';
  }
  return {spacing, padding};
}

const {spacing: baseSpacing, padding: basePadding} = generateSpacing([
  0,
  2, // spacing-50
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
  96 // spacing-1000
] as const);

// This should match the above, but negative. There's no way to negate a number
// type in typescript so this has to be done manually for now.
const {spacing: negativeSpacing, padding: negativePadding} = generateSpacing([
  -2, // spacing-50
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
  -96 // spacing-1000
] as const);

export type PositiveSpacing = keyof typeof baseSpacing;
export type NegativeSpacing = keyof typeof negativeSpacing;
export type Spacing = PositiveSpacing | NegativeSpacing;

export function fontRelative(this: MacroContext | void, base: number, baseFontSize = 14): string {
  return (base / baseFontSize) + 'em';
}

export function edgeToText(this: MacroContext | void, height: keyof typeof baseSpacing): string {
  return `calc(${baseSpacing[height]} * 3 / 8)`;
}

export function space(this: MacroContext | void, px: number): string {
  return pxToRem(px);
}

const relativeSpacing = {
  // font-size relative values
  'text-to-control': fontRelative(10),
  'text-to-visual': {
    default: fontRelative(6), // -> 5px, 5px, 6px, 7px, 8px
    touch: fontRelative(8, 17) // -> 6px, 7px, 8px, 9px, 10px, should be 7px, 7px, 8px, 9px, 11px
  },
  // height relative values
  'edge-to-text': 'calc(self(height, self(minHeight)) * 3 / 8)',
  'pill': 'calc(self(height, self(minHeight)) / 2)'
} as const;

const spacing = {
  ...baseSpacing,
  ...relativeSpacing
};

const padding = {
  ...basePadding,
  ...relativeSpacing
};

export function size(this: MacroContext | void, px: number): `calc(${string})` {
  return `calc(${pxToRem(px)} * var(--s2-scale))`;
}

const sizing = {
  auto: 'auto',
  full: '100%',
  min: 'min-content',
  max: 'max-content',
  fit: 'fit-content'
};

const height = {
  ...sizing,
  screen: '100vh'
};

const width = {
  ...sizing,
  screen: '100vw'
};

function createSpectrumSizingProperty<T extends CSSValue>(property: string, values: PropertyValueMap<T>) {
  return new SizingProperty(property, values, px => `calc(${pxToRem(px)} * var(--s2-scale))`);
}

const margin = {
  ...spacing,
  ...negativeSpacing,
  auto: 'auto'
};

const inset = {
  ...basePadding,
  ...negativePadding,
  auto: 'auto',
  full: '100%'
};

export type Inset = keyof typeof inset;

const translate = {
  ...basePadding,
  ...negativePadding,
  full: '100%'
} as const;

const borderWidth = {
  0: '0px',
  1: getToken('border-width-100'),
  2: getToken('border-width-200'),
  4: getToken('border-width-400')
};

const radius = {
  none: getToken('corner-radius-none'), // 0px
  sm: pxToRem(getToken('corner-radius-small-default')), // 4px
  default: pxToRem(getToken('corner-radius-medium-default')), // 8px
  lg: pxToRem(getToken('corner-radius-large-default')), // 10px
  xl: pxToRem(getToken('corner-radius-extra-large-default')), // 16px
  full: '9999px',
  pill: 'calc(self(height, self(minHeight, 9999px)) / 2)'
};

type GridTrack = 'none' | 'subgrid' | (string & {}) | readonly GridTrackSize[];
type GridTrackSize = 'auto' | 'min-content' | 'max-content' | `${number}fr` | `minmax(${string}, ${string})` | number | (string & {});

let gridTrack = (value: GridTrack) => {
  if (typeof value === 'string') {
    return value;
  }
  return value.map(v => gridTrackSize(v)).join(' ');
};

let gridTrackSize = (value: GridTrackSize) => {
  return typeof value === 'number' ? size(value) : value;
};

const transitionProperty = {
  // var(--gp) is generated by the backgroundImage property when setting a gradient.
  // It includes a list of all of the custom properties used for each color stop.
  default: 'color, background-color, var(--gp, color), border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter',
  colors: 'color, background-color, var(--gp, color), border-color, text-decoration-color, fill, stroke',
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

let durationValue = (value: number | string) => typeof value === 'number' ? value + 'ms' : value;

const fontWeightBase = {
  normal: '400',
  medium: {
    default: '500'
  },
  bold: {
    default: '700',
    ':lang(ja, ko, zh)': '500' // Adobe Clean Han uses 500 as the bold weight
  },
  'extra-bold': {
    default: '800',
    ':lang(ja, ko, zh)': '700' // Adobe Clean Han uses 700 as the extra bold weight.
  },
  black: '900'
} as const;

const fontWeight = {
  ...fontWeightBase,
  heading: {
    default: fontWeightBase[getToken('heading-sans-serif-font-weight') as keyof typeof fontWeightBase],
    ':lang(ja, ko, zh, zh-Hant, zh-Hans)': fontWeightBase[getToken('heading-cjk-font-weight') as keyof typeof fontWeightBase]
  },
  title: {
    default: fontWeightBase[getToken('title-sans-serif-font-weight') as keyof typeof fontWeightBase],
    ':lang(ja, ko, zh, zh-Hant, zh-Hans)': fontWeightBase[getToken('title-cjk-font-weight') as keyof typeof fontWeightBase]
  },
  detail: {
    default: fontWeightBase[getToken('detail-sans-serif-font-weight') as keyof typeof fontWeightBase],
    ':lang(ja, ko, zh, zh-Hant, zh-Hans)': fontWeightBase[getToken('detail-cjk-font-weight') as keyof typeof fontWeightBase]
  }
} as const;

const i18nFonts = {
  ':lang(ar)': 'adobe-clean-arabic, myriad-arabic, ui-sans-serif, system-ui, sans-serif',
  ':lang(he)': 'adobe-clean-hebrew, myriad-hebrew, ui-sans-serif, system-ui, sans-serif',
  ':lang(ja)': "adobe-clean-han-japanese, 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Osaka, YuGothic, 'Yu Gothic', 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif",
  ':lang(ko)': "adobe-clean-han-korean, source-han-korean, 'Malgun Gothic', 'Apple Gothic', sans-serif",
  ':lang(zh)': "adobe-clean-han-traditional, source-han-traditional, 'MingLiu', 'Heiti TC Light', sans-serif",
  // TODO: are these fallbacks supposed to be different than above?
  ':lang(zh-hant)': "adobe-clean-han-traditional, source-han-traditional, 'MingLiu', 'Microsoft JhengHei UI', 'Microsoft JhengHei', 'Heiti TC Light', sans-serif",
  ':lang(zh-HK)': "adobe-clean-han-hong-kong, source-han-hong-kong, 'MingLiu', 'Microsoft JhengHei UI', 'Microsoft JhengHei', 'Heiti TC Light', sans-serif",
  ':lang(zh-Hans, zh-CN, zh-SG)': "adobe-clean-han-simplified-c, source-han-simplified-c, 'SimSun', 'Heiti SC Light', sans-serif"
} as const;

const fontSize = {
  // The default font size scale is for use within UI components.
  'ui-xs': fontSizeToken('font-size-50'),
  'ui-sm': fontSizeToken('font-size-75'),
  ui: fontSizeToken('font-size-100'),
  'ui-lg': fontSizeToken('font-size-200'),
  'ui-xl': fontSizeToken('font-size-300'),
  'ui-2xl': fontSizeToken('font-size-400'),
  'ui-3xl': fontSizeToken('font-size-500'),

  'heading-2xs': fontSizeToken('heading-size-xxs'),
  'heading-xs': fontSizeToken('heading-size-xs'),
  'heading-sm': fontSizeToken('heading-size-s'),
  heading: fontSizeToken('heading-size-m'),
  'heading-lg': fontSizeToken('heading-size-l'),
  'heading-xl': fontSizeToken('heading-size-xl'),
  'heading-2xl': fontSizeToken('heading-size-xxl'),
  'heading-3xl': fontSizeToken('heading-size-xxxl'),

  'title-xs': fontSizeToken('title-size-xs'),
  'title-sm': fontSizeToken('title-size-s'),
  title: fontSizeToken('title-size-m'),
  'title-lg': fontSizeToken('title-size-l'),
  'title-xl': fontSizeToken('title-size-xl'),
  'title-2xl': fontSizeToken('title-size-xxl'),
  'title-3xl': fontSizeToken('title-size-xxxl'),

  // Body is for large blocks of text, e.g. paragraphs, not in UI components.
  'body-2xs': fontSizeToken('font-size-50'), // TODO: seems like there is no token for this
  'body-xs': fontSizeToken('body-size-xs'),
  'body-sm': fontSizeToken('body-size-s'),
  body: fontSizeToken('body-size-m'),
  'body-lg': fontSizeToken('body-size-l'),
  'body-xl': fontSizeToken('body-size-xl'),
  'body-2xl': fontSizeToken('body-size-xxl'),
  'body-3xl': fontSizeToken('body-size-xxxl'),

  'detail-sm': fontSizeToken('detail-size-s'),
  detail: fontSizeToken('detail-size-m'),
  'detail-lg': fontSizeToken('detail-size-l'),
  'detail-xl': fontSizeToken('detail-size-xl'),

  'code-xs': fontSizeToken('code-size-xs'),
  'code-sm': fontSizeToken('code-size-s'),
  code: fontSizeToken('code-size-m'),
  'code-lg': fontSizeToken('code-size-l'),
  'code-xl': fontSizeToken('code-size-xl')
} as const;

// Line heights linearly interpolate between 1.3 and 1.15 for font sizes between 10 and 32, rounded to the nearest 2px.
// Text above 32px always has a line height of 1.15.
const fontSizeCalc = 'var(--s2-font-size-base, 14) * var(--fs)';
const minFontScale = 1.15;
const maxFontScale = 1.3;
const minFontSize = 10;
const maxFontSize = 32;
const lineHeightCalc = `round(1em * (${minFontScale} + (1 - ((min(${maxFontSize}, ${fontSizeCalc}) - ${minFontSize})) / ${maxFontSize - minFontSize}) * ${(maxFontScale - minFontScale).toFixed(2)}), 2px)`;

export const style = createTheme({
  properties: {
    // colors
    color: new SpectrumColorProperty('color', {
      ...baseColors,
      accent: colorToken('accent-content-color-default'),
      neutral: colorToken('neutral-content-color-default'),
      'neutral-subdued': colorToken('neutral-subdued-content-color-default'),
      negative: colorToken('negative-content-color-default'),
      disabled: colorToken('disabled-content-color'),
      heading: colorToken('heading-color'),
      title: colorToken('title-color'),
      body: colorToken('body-color'),
      detail: colorToken('detail-color'),
      code: colorToken('code-color'),
      auto: autoStaticColor('self(backgroundColor, var(--s2-container-bg))')
    }),
    backgroundColor: new SpectrumColorProperty('backgroundColor', {
      ...baseColors,
      accent: weirdColorToken('accent-background-color-default'),
      'accent-subtle': weirdColorToken('accent-subtle-background-color-default'),
      neutral: colorToken('neutral-background-color-default'),
      'neutral-subdued': weirdColorToken('neutral-subdued-background-color-default'),
      'neutral-subtle': weirdColorToken('neutral-subtle-background-color-default'),
      negative: weirdColorToken('negative-background-color-default'),
      'negative-subtle': weirdColorToken('negative-subtle-background-color-default'),
      informative: weirdColorToken('informative-background-color-default'),
      'informative-subtle': weirdColorToken('informative-subtle-background-color-default'),
      positive: weirdColorToken('positive-background-color-default'),
      'positive-subtle': weirdColorToken('positive-subtle-background-color-default'),
      notice: weirdColorToken('notice-background-color-default'),
      'notice-subtle': weirdColorToken('notice-subtle-background-color-default'),
      gray: weirdColorToken('gray-background-color-default'),
      'gray-subtle': weirdColorToken('gray-subtle-background-color-default'),
      red: weirdColorToken('red-background-color-default'),
      'red-subtle': weirdColorToken('red-subtle-background-color-default'),
      orange: weirdColorToken('orange-background-color-default'),
      'orange-subtle': weirdColorToken('orange-subtle-background-color-default'),
      yellow: weirdColorToken('yellow-background-color-default'),
      'yellow-subtle': weirdColorToken('yellow-subtle-background-color-default'),
      chartreuse: weirdColorToken('chartreuse-background-color-default'),
      'chartreuse-subtle': weirdColorToken('chartreuse-subtle-background-color-default'),
      celery: weirdColorToken('celery-background-color-default'),
      'celery-subtle': weirdColorToken('celery-subtle-background-color-default'),
      green: weirdColorToken('green-background-color-default'),
      'green-subtle': weirdColorToken('green-subtle-background-color-default'),
      seafoam: weirdColorToken('seafoam-background-color-default'),
      'seafoam-subtle': weirdColorToken('seafoam-subtle-background-color-default'),
      cyan: weirdColorToken('cyan-background-color-default'),
      'cyan-subtle': weirdColorToken('cyan-subtle-background-color-default'),
      blue: weirdColorToken('blue-background-color-default'),
      'blue-subtle': weirdColorToken('blue-subtle-background-color-default'),
      indigo: weirdColorToken('indigo-background-color-default'),
      'indigo-subtle': weirdColorToken('indigo-subtle-background-color-default'),
      purple: weirdColorToken('purple-background-color-default'),
      'purple-subtle': weirdColorToken('purple-subtle-background-color-default'),
      fuchsia: weirdColorToken('fuchsia-background-color-default'),
      'fuchsia-subtle': weirdColorToken('fuchsia-subtle-background-color-default'),
      magenta: weirdColorToken('magenta-background-color-default'),
      'magenta-subtle': weirdColorToken('magenta-subtle-background-color-default'),
      pink: weirdColorToken('pink-background-color-default'),
      'pink-subtle': weirdColorToken('pink-subtle-background-color-default'),
      turquoise: weirdColorToken('turquoise-background-color-default'),
      'turquoise-subtle': weirdColorToken('turquoise-subtle-background-color-default'),
      cinnamon: weirdColorToken('cinnamon-background-color-default'),
      'cinnamon-subtle': weirdColorToken('cinnamon-subtle-background-color-default'),
      brown: weirdColorToken('brown-background-color-default'),
      'brown-subtle': weirdColorToken('brown-subtle-background-color-default'),
      silver: weirdColorToken('silver-background-color-default'),
      'silver-subtle': weirdColorToken('silver-subtle-background-color-default'),
      disabled: colorToken('disabled-background-color'),
      base: colorToken('background-base-color'),
      'layer-1': colorToken('background-layer-1-color'),
      'layer-2': weirdColorToken('background-layer-2-color'),
      pasteboard: weirdColorToken('background-pasteboard-color'),
      elevated: weirdColorToken('background-elevated-color')
    }),
    borderColor: new SpectrumColorProperty('borderColor', {
      ...baseColors,
      negative: colorToken('negative-border-color-default'),
      disabled: colorToken('disabled-border-color')
    }),
    outlineColor: new SpectrumColorProperty('outlineColor', {
      ...baseColors,
      'focus-ring': {
        ...colorToken('focus-indicator-color'),
        forcedColors: 'Highlight'
      }
    }),
    fill: new SpectrumColorProperty('fill', {
      none: 'none',
      currentColor: 'currentColor',
      accent: weirdColorToken('accent-visual-color'),
      neutral: weirdColorToken('neutral-visual-color'),
      negative: weirdColorToken('negative-visual-color'),
      informative: weirdColorToken('informative-visual-color'),
      positive: weirdColorToken('positive-visual-color'),
      notice: weirdColorToken('notice-visual-color'),
      gray: weirdColorToken('gray-visual-color'),
      red: weirdColorToken('red-visual-color'),
      orange: weirdColorToken('orange-visual-color'),
      yellow: weirdColorToken('yellow-visual-color'),
      chartreuse: weirdColorToken('chartreuse-visual-color'),
      celery: weirdColorToken('celery-visual-color'),
      green: weirdColorToken('green-visual-color'),
      seafoam: weirdColorToken('seafoam-visual-color'),
      cyan: weirdColorToken('cyan-visual-color'),
      blue: weirdColorToken('blue-visual-color'),
      indigo: weirdColorToken('indigo-visual-color'),
      purple: weirdColorToken('purple-visual-color'),
      fuchsia: weirdColorToken('fuchsia-visual-color'),
      magenta: weirdColorToken('magenta-visual-color'),
      pink: weirdColorToken('pink-visual-color'),
      turquoise: weirdColorToken('turquoise-visual-color'),
      cinnamon: weirdColorToken('cinnamon-visual-color'),
      brown: weirdColorToken('brown-visual-color'),
      silver: weirdColorToken('silver-visual-color'),
      ...baseColors
    }),
    stroke: new SpectrumColorProperty('stroke', {
      none: 'none',
      currentColor: 'currentColor',
      ...baseColors
    }),

    // dimensions
    borderSpacing: baseSpacing, // TODO: separate x and y
    flexBasis: createSpectrumSizingProperty('flexBasis', {
      auto: 'auto',
      full: '100%'
    }),
    rowGap: spacing,
    columnGap: spacing,
    height: createSpectrumSizingProperty('height', height),
    width: createSpectrumSizingProperty('width', width),
    containIntrinsicWidth: createSpectrumSizingProperty('containIntrinsicWidth', width),
    containIntrinsicHeight: createSpectrumSizingProperty('containIntrinsicHeight', height),
    minHeight: createSpectrumSizingProperty('minHeight', height),
    maxHeight: createSpectrumSizingProperty('maxHeight', (() => {
      // auto is not a valid value for maxHeight
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {auto, ...rest} = height;
      return {...rest, none: 'none'};
    })()),
    minWidth: createSpectrumSizingProperty('minWidth', width),
    maxWidth: createSpectrumSizingProperty('maxWidth', (() => {
      // auto is not a valid value for maxWidth
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {auto, ...rest} = width;
      return {...rest, none: 'none'};
    })()),
    borderStartWidth: new MappedProperty('borderInlineStartWidth', borderWidth),
    borderEndWidth: new MappedProperty('borderInlineEndWidth', borderWidth),
    borderTopWidth: borderWidth,
    borderBottomWidth: borderWidth,
    borderStyle: ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none'] as const,
    strokeWidth: {
      0: '0',
      1: '1',
      2: '2'
    },
    marginStart: new PercentageProperty('marginInlineStart', margin),
    marginEnd: new PercentageProperty('marginInlineEnd', margin),
    marginTop: new PercentageProperty('marginTop', margin),
    marginBottom: new PercentageProperty('marginBottom', margin),
    paddingStart: new PercentageProperty('paddingInlineStart', padding),
    paddingEnd: new PercentageProperty('paddingInlineEnd', padding),
    paddingTop: new PercentageProperty('paddingTop', padding),
    paddingBottom: new PercentageProperty('paddingBottom', padding),
    scrollMarginStart: new MappedProperty('scrollMarginInlineStart', baseSpacing),
    scrollMarginEnd: new MappedProperty('scrollMarginInlineEnd', baseSpacing),
    scrollMarginTop: baseSpacing,
    scrollMarginBottom: baseSpacing,
    // Using rems instead of px here (unlike regular padding) because this often needs to match the height of something.
    scrollPaddingStart: new MappedProperty('scrollPaddingInlineStart', baseSpacing),
    scrollPaddingEnd: new MappedProperty('scrollPaddingInlineEnd', baseSpacing),
    scrollPaddingTop: baseSpacing,
    scrollPaddingBottom: baseSpacing,
    textIndent: new PercentageProperty('textIndent', baseSpacing),
    translateX: new ExpandedProperty(['--translateX', 'translate'], value => ({
      '--translateX': String(value),
      translate: 'var(--translateX, 0) var(--translateY, 0)'
    }), new PercentageProperty('--translateX', translate)),
    translateY: new ExpandedProperty(['--translateY', 'translate'], value => ({
      '--translateY': String(value),
      translate: 'var(--translateX, 0) var(--translateY, 0)'
    }), new PercentageProperty('--translateY', translate)),
    rotate: new ArbitraryProperty('rotate', (value: number | `${number}deg` | `${number}rad` | `${number}grad` | `${number}turn`) => typeof value === 'number' ? `${value}deg` : value),
    scaleX: new ExpandedProperty<number | `${number}%`>(['--scaleX', 'scale'], value => ({
      '--scaleX': String(value),
      scale: 'var(--scaleX, 1) var(--scaleY, 1)'
    })),
    scaleY: new ExpandedProperty<number | `${number}%`>(['--scaleY', 'scale'], value => ({
      '--scaleY': String(value),
      scale: 'var(--scaleX, 1) var(--scaleY, 1)'
    })),
    transform: new ArbitraryProperty<string>('transform'),
    position: ['absolute', 'fixed', 'relative', 'sticky', 'static'] as const,
    insetStart: new PercentageProperty('insetInlineStart', inset),
    insetEnd: new PercentageProperty('insetInlineEnd', inset),
    top: new PercentageProperty('top', inset),
    left: new PercentageProperty('left', inset),
    bottom: new PercentageProperty('bottom', inset),
    right: new PercentageProperty('right', inset),
    aspectRatio: new ArbitraryProperty<'auto' | 'square' | 'video' | `${number}/${number}`>('aspectRatio', value => {
      if (value === 'square') {
        return '1/1';
      }

      if (value === 'video') {
        return '16/9';
      }

      return value;
    }),

    // text
    fontFamily: {
      sans: {
        default: 'var(--s2-font-family-sans, adobe-clean-spectrum-vf), adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif',
        ...i18nFonts
      },
      serif: {
        default: 'var(--s2-font-family-serif, adobe-clean-spectrum-srf-vf), adobe-clean-serif, "Source Serif", Georgia, serif',
        ...i18nFonts
      },
      code: 'source-code-pro, "Source Code Pro", Monaco, monospace'
    },
    fontSize: new ExpandedProperty<keyof typeof fontSize>(['--fs', 'fontSize'], (value) => {
      if (typeof value === 'number') {
        return {
          '--fs': `pow(1.125, ${value})`,
          fontSize: `round(${fontSizeCalc} / 16 * ${process.env.DOCS_ENV ? 'var(--rem, 1rem)' : '1rem'}, 1px)`
        } as CSSProperties;
      }

      return {fontSize: value};
    }, fontSize),
    fontWeight: new ExpandedProperty<keyof typeof fontWeight>(['fontWeight', 'fontVariationSettings', 'fontSynthesisWeight'], (value) => {
      return {
        fontWeight: value as any,
        fontSynthesisWeight: 'none'
      };
    }, fontWeight),
    lineHeight: {
      // See https://spectrum.corp.adobe.com/page/typography/#Line-height
      ui: {
        // Calculate line-height based on font size.
        default: lineHeightCalc,
        // CJK fonts use a larger line-height.
        ':lang(ja, ko, zh, zh-Hant, zh-Hans, zh-CN, zh-SG)': getToken('line-height-200')
      },
      heading: {
        default: lineHeightCalc,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans, zh-CN, zh-SG)': getToken('heading-cjk-line-height')
      },
      title: {
        default: lineHeightCalc,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans, zh-CN, zh-SG)': getToken('title-cjk-line-height')
      },
      body: {
        // Body text uses spacious line height, 1.5 for all font sizes.
        default: getToken('body-line-height'),
        ':lang(ja, ko, zh, zh-Hant, zh-Hans, zh-CN, zh-SG)': getToken('body-cjk-line-height')
      },
      detail: {
        default: lineHeightCalc,
        ':lang(ja, ko, zh, zh-Hant, zh-Hans, zh-CN, zh-SG)': getToken('detail-cjk-line-height')
      },
      code: {
        default: getToken('code-line-height'),
        ':lang(ja, ko, zh, zh-Hant, zh-Hans, zh-CN, zh-SG)': getToken('code-cjk-line-height')
      }
    },
    listStyleType: ['none', 'disc', 'decimal'] as const,
    listStylePosition: ['inside', 'outside'] as const,
    textTransform: ['uppercase', 'lowercase', 'capitalize', 'none'] as const,
    textAlign: ['start', 'center', 'end', 'justify'] as const,
    verticalAlign: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super'] as const,
    textDecoration: new ExpandedProperty<'underline' | 'overline' | 'line-through' | 'none'>(['textDecoration', 'textUnderlineOffset'], (value) => ({
      textDecoration: value === 'none' ? 'none' : `${value} ${getToken('text-underline-thickness')}`,
      textUnderlineOffset: value === 'underline' ? getToken('text-underline-gap') : undefined
    })),
    textOverflow: ['ellipsis', 'clip'] as const,
    lineClamp: new ExpandedProperty<number>(['overflow', 'display', '-webkit-box-orient', '-webkit-line-clamp'], (value) => ({
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': String(value)
    })),
    hyphens: ['none', 'manual', 'auto'] as const,
    whiteSpace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces'] as const,
    textWrap: ['wrap', 'nowrap', 'balance', 'pretty'] as const,
    wordBreak: ['normal', 'break-all', 'keep-all', 'break-word'] as const,
    overflowWrap: ['normal', 'anywhere', 'break-word'] as const,
    boxDecorationBreak: ['slice', 'clone'] as const,

    // effects
    boxShadow: {
      emphasized: shadowToken('drop-shadow-emphasized').join(', '),
      elevated: shadowToken('drop-shadow-elevated').join(', '),
      dragged: shadowToken('drop-shadow-dragged').join(', '),
      none: 'none'
    },
    filter: {
      // layer order is reversed for filter property. filters are applied in the order they are specified.
      emphasized: shadowToken('drop-shadow-emphasized').reverse().map(s => `drop-shadow(${s})`).join(' '),
      elevated: shadowToken('drop-shadow-elevated').reverse().map(s => `drop-shadow(${s})`).join(' '),
      dragged: shadowToken('drop-shadow-dragged').reverse().map(s => `drop-shadow(${s})`).join(' '),
      none: 'none'
    },
    borderTopStartRadius: new MappedProperty('borderStartStartRadius', radius),
    borderTopEndRadius: new MappedProperty('borderStartEndRadius', radius),
    borderBottomStartRadius: new MappedProperty('borderEndStartRadius', radius),
    borderBottomEndRadius: new MappedProperty('borderEndEndRadius', radius),
    forcedColorAdjust: ['auto', 'none'] as const,
    colorScheme: ['light', 'dark', 'light dark'] as const,
    backgroundImage: new ExpandedProperty<string | [LinearGradient]>(['backgroundImage', '--g0', '--g1', '--g2', '--gp'], (value) => {
      if (typeof value === 'string') {
        return {backgroundImage: value};
      } else if (Array.isArray(value) && value[0]?.type === 'linear-gradient') {
        let values: CSSProperties = {
          backgroundImage: `linear-gradient(${value[0].angle}, ${value[0].stops.map(([, stop], i) => `var(--g${i}) ${stop}%`)})`
        };

        // Create a CSS var for each color stop so the gradient can be transitioned.
        // These are registered via @property in the `linearGradient` macro.
        let properties: string[] = [];
        value[0].stops.forEach(([colorValue], i) => {
          properties.push(`--g${i}`);
          values[`--g${i}`] = color(colorValue);
        });

        // This is used by transition-property so we automatically transition all of the color stops.
        values['--gp'] = properties.join(', ');
        return values;
      } else {
        throw new Error('Unexpected backgroundImage value: ' + JSON.stringify(value));
      }
    }),
    // TODO: do we need separate x and y properties?
    backgroundPosition: ['bottom', 'center', 'left', 'left bottom', 'left top', 'right', 'right bottom', 'right top', 'top'] as const,
    backgroundSize: ['auto', 'cover', 'contain'] as const,
    backgroundAttachment: ['fixed', 'local', 'scroll'] as const,
    backgroundClip: ['border-box', 'padding-box', 'content-box', 'text'] as const,
    backgroundRepeat: ['repeat', 'no-repeat', 'repeat-x', 'repeat-y', 'round', 'space'] as const,
    backgroundOrigin: ['border-box', 'padding-box', 'content-box'] as const,
    backgroundBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'] as const,
    mixBlendMode: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'plus-darker', 'plus-lighter'] as const,
    opacity: new ArbitraryProperty<number>('opacity'),

    outlineStyle: ['none', 'solid', 'dashed', 'dotted', 'double', 'inset'] as const,
    outlineOffset: new ArbitraryProperty<number>('outlineOffset', v => `${v}px`),
    outlineWidth: borderWidth,

    transition: new MappedProperty('transitionProperty', transitionProperty),
    transitionDelay: new ArbitraryProperty('transitionDelay', durationValue),
    transitionDuration: new ArbitraryProperty('transitionDuration', durationValue),
    transitionTimingFunction: timingFunction,
    animation: new ArbitraryProperty<string>('animationName'),
    animationDuration: new ArbitraryProperty('animationDuration', durationValue),
    animationDelay: new ArbitraryProperty('animationDelay', durationValue),
    animationDirection: ['normal', 'reverse', 'alternate', 'alternate-reverse'] as const,
    animationFillMode: ['none', 'forwards', 'backwards', 'both'] as const,
    animationIterationCount: new ArbitraryProperty<number | string>('animationIterationCount'),
    animationTimingFunction: timingFunction,
    animationPlayState: ['paused', 'running'] as const,

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
    flexShrink: new ArbitraryProperty<CSS.Property.FlexShrink>('flexShrink'),
    flexGrow: new ArbitraryProperty<CSS.Property.FlexGrow>('flexGrow'),
    gridColumnStart: new ArbitraryProperty<CSS.Property.GridColumnStart>('gridColumnStart'),
    gridColumnEnd: new ArbitraryProperty<CSS.Property.GridColumnEnd>('gridColumnEnd'),
    gridRowStart: new ArbitraryProperty<CSS.Property.GridRowStart>('gridRowStart'),
    gridRowEnd: new ArbitraryProperty<CSS.Property.GridRowEnd>('gridRowEnd'),
    gridAutoFlow: ['row', 'column', 'dense', 'row dense', 'column dense'] as const,
    gridAutoRows: new ArbitraryProperty('gridAutoRows', gridTrackSize),
    gridAutoColumns: new ArbitraryProperty('gridAutoColumns', gridTrackSize),
    gridTemplateColumns: new ArbitraryProperty('gridTemplateColumns', gridTrack),
    gridTemplateRows: new ArbitraryProperty('gridTemplateRows', gridTrack),
    gridTemplateAreas: new ArbitraryProperty('gridTemplateAreas', (value: readonly string[]) => value.map(v => `"${v}"`).join('')),
    float: ['inline-start', 'inline-end', 'right', 'left', 'none'] as const,
    clear: ['inline-start', 'inline-end', 'left', 'right', 'both', 'none'] as const,
    contain: ['none', 'strict', 'content', 'size', 'inline-size', 'layout', 'style', 'paint'] as const,
    containerType: ['normal', 'size', 'inline-size', 'scroll-state'] as const,
    containerName: new ArbitraryProperty<string>('containerName'),
    boxSizing: ['border-box', 'content-box'] as const,
    tableLayout: ['auto', 'fixed'] as const,
    captionSide: ['top', 'bottom'] as const,
    borderCollapse: ['collapse', 'separate'] as const,
    breakBefore: ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'] as const,
    breakInside: ['auto', 'avoid', 'avoid-page', 'avoid-column'] as const,
    breakAfter: ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'] as const,
    overflowX: ['auto', 'hidden', 'clip', 'visible', 'scroll'] as const,
    overflowY: ['auto', 'hidden', 'clip', 'visible', 'scroll'] as const,
    overscrollBehaviorX: ['auto', 'contain', 'none'] as const,
    overscrollBehaviorY: ['auto', 'contain', 'none'] as const,
    scrollBehavior: ['auto', 'smooth'] as const,
    scrollbarWidth: ['none', 'auto', 'thin'] as const,
    order: new ArbitraryProperty<number>('order'),

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
    zIndex: new ArbitraryProperty<number>('zIndex'),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    disableTapHighlight: new ArbitraryProperty('-webkit-tap-highlight-color', (_value: true) => 'rgba(0,0,0,0)'),
    unicodeBidi: ['normal', 'embed', 'bidi-override', 'isolate', 'isolate-override', 'plaintext'] as const,
    caretColor: ['auto', 'transparent'] as const
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
    scale: ['scaleX', 'scaleY'] as const,
    inset: ['top', 'bottom', 'insetStart', 'insetEnd'] as const,
    insetX: ['insetStart', 'insetEnd'] as const,
    insetY: ['top', 'bottom'] as const,
    placeItems: ['alignItems', 'justifyItems'] as const,
    placeContent: ['alignContent', 'justifyContent'] as const,
    placeSelf: ['alignSelf', 'justifySelf'] as const,
    gap: ['rowGap', 'columnGap'] as const,
    size: ['width', 'height'] as const,
    minSize: ['minWidth', 'minHeight'] as const,
    maxSize: ['maxWidth', 'maxHeight'] as const,
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
    }),
    font: (value: keyof typeof fontSize) => {
      let type = value.split('-')[0];
      return {
        fontFamily: type === 'code' ? 'code' : 'sans',
        fontSize: value,
        fontWeight: type === 'heading' || type === 'title' || type === 'detail' ? type : 'normal',
        lineHeight: type,
        color: type === 'ui' ? 'body' : type
      };
    }
  },
  conditions: {
    // In the docs we need to be able to simulate HCM.
    forcedColors: process.env.DOCS_ENV ? ['@media (forced-colors: active)', ':is([data-hcm], [data-hcm] *)'] : '@media (forced-colors: active)',
    // This detects touch primary devices as best as we can.
    // Ideally we'd use (pointer: course) but browser/device support is inconsistent.
    // Samsung Android devices claim to be mice at the hardware/OS level: (any-pointer: fine), (any-hover: hover), (hover: hover), and nothing for pointer.
    // More details: https://www.ctrl.blog/entry/css-media-hover-samsung.html
    // iPhone matches (any-hover: none), (hover: none), and nothing for any-pointer or pointer.
    // If a trackpad or Apple Pencil is connected to iPad, it matches (any-pointer: fine), (any-hover: hover), (hover: none).
    // Windows tablet matches the same as iPhone. No difference when a mouse is connected.
    // Windows touch laptop matches same as macOS: (any-pointer: fine), (pointer: fine), (any-hover: hover), (hover: hover).
    touch: '@media not ((hover: hover) and (pointer: fine))',
    xs: `@media (min-width: ${(480 / 16)}rem)`,
    sm: `@media (min-width: ${(640 / 16)}rem)`,
    md: `@media (min-width: ${(768 / 16)}rem)`,
    lg: `@media (min-width: ${(1024 / 16)}rem)`,
    xl: `@media (min-width: ${(1280 / 16)}rem)`,
    '2xl': `@media (min-width: ${(1536 / 16)}rem)`
  }
});
