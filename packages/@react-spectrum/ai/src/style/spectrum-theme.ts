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

// This is a copy of @react-spectrum/s2's spectrum-theme.
// It contains only the build-time color and font helpers the `prose` macro
// needs. It is duplicated here so the prose macro is self-contained.

import {
  ColorRef,
  colorScale,
  ColorToken,
  fontSizeToken,
  generateOverlayColorScale,
  getToken,
  simpleColorScale
} from './tokens' with {type: 'macro'};

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
export function resolveColorToken(token: string | ColorToken | ColorRef): ColorToken {
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

export function colorTokenToString(token: ColorToken, opacity?: string | number) {
  let result =
    token.light === token.dark ? token.light : `light-dark(${token.light}, ${token.dark})`;
  if (opacity) {
    result = `rgb(from ${result} r g b / ${opacity}%)`;
  }
  return result;
}

const fontWeightBase = {
  normal: {
    default: '400'
  },
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
  black: {
    default: '900'
  }
} as const;

export const fontWeight = {
  ...fontWeightBase,
  heading: {
    ...fontWeightBase[getToken('heading-sans-serif-font-weight') as keyof typeof fontWeightBase],
    ':lang(ja, ko, zh, zh-Hant, zh-Hans)':
      fontWeightBase[getToken('heading-cjk-font-weight') as keyof typeof fontWeightBase]
  },
  title: {
    ...fontWeightBase[getToken('title-sans-serif-font-weight') as keyof typeof fontWeightBase],
    ':lang(ja, ko, zh, zh-Hant, zh-Hans)':
      fontWeightBase[getToken('title-cjk-font-weight') as keyof typeof fontWeightBase]
  },
  detail: {
    ...fontWeightBase[getToken('detail-sans-serif-font-weight') as keyof typeof fontWeightBase],
    ':lang(ja, ko, zh, zh-Hant, zh-Hans)':
      fontWeightBase[getToken('detail-cjk-font-weight') as keyof typeof fontWeightBase]
  }
} as const;

export const i18nFonts = {
  ':lang(ar)': 'adobe-clean-arabic, myriad-arabic, ui-sans-serif, system-ui, sans-serif',
  ':lang(he)': 'adobe-clean-hebrew, myriad-hebrew, ui-sans-serif, system-ui, sans-serif',
  ':lang(ja)':
    "adobe-clean-han-japanese, 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Osaka, YuGothic, 'Yu Gothic', 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif",
  ':lang(ko)':
    "adobe-clean-han-korean, source-han-korean, 'Malgun Gothic', 'Apple Gothic', sans-serif",
  ':lang(zh)':
    "adobe-clean-han-traditional, source-han-traditional, 'MingLiu', 'Heiti TC Light', sans-serif",
  // TODO: are these fallbacks supposed to be different than above?
  ':lang(zh-hant)':
    "adobe-clean-han-traditional, source-han-traditional, 'MingLiu', 'Microsoft JhengHei UI', 'Microsoft JhengHei', 'Heiti TC Light', sans-serif",
  ':lang(zh-HK)':
    "adobe-clean-han-hong-kong, source-han-hong-kong, 'MingLiu', 'Microsoft JhengHei UI', 'Microsoft JhengHei', 'Heiti TC Light', sans-serif",
  ':lang(zh-Hans, zh-CN, zh-SG)':
    "adobe-clean-han-simplified-c, source-han-simplified-c, 'SimSun', 'Heiti SC Light', sans-serif"
} as const;

export const fontSize = {
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

export const fontFamily = {
  sans: {
    default:
      'var(--s2-font-family-sans, adobe-clean-spectrum-vf), adobe-clean-variable, adobe-clean, ui-sans-serif, system-ui, sans-serif',
    ...i18nFonts
  },
  serif: {
    default:
      'var(--s2-font-family-serif, adobe-clean-spectrum-srf-vf), adobe-clean-serif, "Source Serif", Georgia, serif',
    ...i18nFonts
  },
  code: 'source-code-pro, "Source Code Pro", Monaco, monospace'
} as const;

// Line heights linearly interpolate between 1.3 and 1.15 for font sizes between 10 and 32, rounded to the nearest 2px.
// Text above 32px always has a line height of 1.15.
export const fontSizeCalc = 'var(--s2-font-size-base, 14) * var(--fs)';
const minFontScale = 1.15;
const maxFontScale = 1.3;
const minFontSize = 10;
const maxFontSize = 32;
const lineHeightCalc = `round(1em * (${minFontScale} + (1 - ((min(${maxFontSize}, ${fontSizeCalc}) - ${minFontSize})) / ${maxFontSize - minFontSize}) * ${(maxFontScale - minFontScale).toFixed(2)}), 2px)`;
export const lineHeight = {
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
} as const;
