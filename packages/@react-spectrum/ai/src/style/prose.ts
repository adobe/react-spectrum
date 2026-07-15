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

import {colorToken, getToken} from './tokens';
import {
  colorTokenToString,
  fontFamily,
  fontSize,
  fontSizeCalc,
  fontWeight,
  lineHeight,
  resolveColorToken
} from './spectrum-theme';

interface MacroContext {
  addAsset(asset: {type: string; content: string}): void;
}

const marginTop = {
  body: getToken('body-margin-multiplier') + 'em',
  heading: getToken('heading-margin-top-multiplier') + 'em',
  title: getToken('title-margin-top-multiplier') + 'em',
  detail: getToken('detail-margin-top-multiplier') + 'em'
} as const;

const marginBottom = {
  body: getToken('body-margin-multiplier') + 'em',
  heading: getToken('heading-margin-bottom-multiplier') + 'em',
  title: getToken('title-margin-bottom-multiplier') + 'em',
  detail: getToken('detail-margin-bottom-multiplier') + 'em'
} as const;

export function prose(this: MacroContext | void) {
  let rules = {
    '.prose': font('body'),
    h1: {
      ...font('heading-xl'),
      ...margin('heading')
    },
    h2: {
      ...font('heading-lg'),
      ...margin('heading')
    },
    h3: {
      ...font('heading'),
      ...margin('heading')
    },
    h4: {
      ...font('heading-sm'),
      ...margin('heading')
    },
    h5: {
      ...font('heading-xs'),
      ...margin('heading')
    },
    h6: {
      ...font('heading-2xs'),
      ...margin('heading')
    },
    pre: {
      ...font('code-sm'),
      ...margin('body'),
      borderRadius: getToken('corner-radius-large-default'),
      backgroundColor: colorTokenToString(
        resolveColorToken(colorToken('background-layer-1-color'))
      ),
      margin: 0,
      padding: '16px',
      width: '100%',
      overflow: 'auto',
      boxSizing: 'border-box'
    },
    p: {
      ...margin('body')
    },
    'ul, ol': {
      paddingInlineStart: `${24 / 16}rem`,
      marginTop: {
        default: marginTop.body,
        ':is(li > *)': 0
      },
      marginBottom: {
        default: marginBottom.body,
        ':is(li > *)': 0
      }
    },
    ul: {
      listStyleType: 'disc'
    },
    ol: {
      listStyleType: 'decimal'
    },
    'li > p:last-child:not(:first-child)': {
      marginBottom: marginBottom.body
    },
    blockquote: {
      ...margin('body'),
      borderStyle: 'solid',
      borderWidth: 0,
      borderColor: colorTokenToString(resolveColorToken(colorToken('gray-200'))),
      borderInlineStartWidth: 2,
      paddingInlineStart: 12,
      marginInlineStart: 4
    },
    hr: {
      marginBlock: '32px',
      height: '2px',
      borderRadius: '2px',
      borderStyle: 'none',
      backgroundColor: colorTokenToString(resolveColorToken(colorToken('gray-200')))
    },
    'code:not(pre code)': {
      ...font('code'),
      fontSize: 'inherit',
      backgroundColor: colorTokenToString(
        resolveColorToken(colorToken('background-layer-1-color'))
      ),
      paddingInline: '4px',
      borderWidth: 1,
      borderColor: colorTokenToString(resolveColorToken(colorToken('gray-100'))),
      borderStyle: 'solid',
      borderRadius: getToken('corner-radius-small-default'),
      whiteSpace: 'pre-wrap'
    },
    kbd: {
      ...font('ui'),
      fontSize: 'inherit',
      paddingInline: '8px',
      paddingBlock: '2px',
      whiteSpace: 'nowrap',
      backgroundColor: colorTokenToString(resolveColorToken(colorToken('gray-100'))),
      borderRadius: getToken('corner-radius-small-default'),
      unicodeBidi: 'plaintext'
    },
    a: {
      color: {
        default: colorTokenToString(resolveColorToken(colorToken('accent-content-color-default'))),
        ':hover': colorTokenToString(resolveColorToken(colorToken('accent-content-color-hover'))),
        ':active': colorTokenToString(resolveColorToken(colorToken('accent-content-color-down')))
      },
      textDecoration: 'underline',
      transition: 'color 200ms'
    },
    ':is(h1, h2, h3, h4, h5, h6, hr) + *': {
      marginTop: 0
    },
    table: {
      ...font('ui'),
      ...margin('body'),
      backgroundColor: colorTokenToString(resolveColorToken(colorToken('gray-25'))),
      borderRadius: getToken('corner-radius-medium-default'),
      borderColor: colorTokenToString(resolveColorToken(colorToken('gray-300'))),
      borderWidth: '1px',
      borderStyle: 'solid',
      overflow: 'hidden',
      borderSpacing: 0,
      width: 'full'
    },
    thead: {
      backgroundColor: colorTokenToString(resolveColorToken(colorToken('gray-75'))),
      borderTopRadius: 'default'
    },
    th: {
      paddingInline: '16px',
      textAlign: 'start',
      fontWeight: 'bold',
      borderColor: colorTokenToString(resolveColorToken(colorToken('gray-300'))),
      borderWidth: 0,
      borderBottomWidth: 1,
      borderStyle: 'solid',
      height: '32px',
      boxSizing: 'border-box'
    },
    td: {
      paddingInline: '16px',
      paddingBlock: '4px',
      borderWidth: 0,
      borderBottomWidth: {
        default: '1px',
        ':is(tbody:last-child > tr:last-child > *)': 0
      },
      borderStyle: 'solid',
      borderColor: colorTokenToString(resolveColorToken(colorToken('gray-300'))),
      boxSizing: 'border-box'
    },
    'img, video': {
      maxWidth: '100%'
    },
    figure: {
      ...margin('body'),
      marginInline: 0
    },
    figcaption: {
      ...font('body-sm'),
      textAlign: 'center'
    }
  };

  let css = '';
  for (let key in rules) {
    let selector = key === '.prose' ? '.prose' : `.prose ${key}`;
    css += `${selector} {\n`;
    let properties = rules[key];
    for (let property in properties) {
      let value = properties[property];
      let prop = property.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`);
      if (typeof value === 'object') {
        if (value.default) {
          css += `  ${prop}: ${value.default};\n`;
        }
        for (let condition in value) {
          // eslint-disable-next-line
          if (condition === 'default') {
            continue;
          }
          css += `  ${condition.startsWith(':') ? '&' : ''}${condition} { ${prop}: ${value[condition]}; }\n`;
        }
      } else {
        css += `  ${prop}: ${value};\n`;
      }
    }

    css += `}\n\n`;
  }

  this?.addAsset({
    type: 'css',
    content: css
  });

  return 'prose';
}

// Text color per font category. Resolved from static token names so the values
// can be inlined at build time when `./tokens` is imported as a macro (matching
// how spectrum-theme consumes tokens); a dynamically computed token name cannot.
const fontColor = {
  body: colorTokenToString(resolveColorToken(colorToken('body-color'))),
  heading: colorTokenToString(resolveColorToken(colorToken('heading-color'))),
  title: colorTokenToString(resolveColorToken(colorToken('title-color'))),
  detail: colorTokenToString(resolveColorToken(colorToken('detail-color'))),
  code: colorTokenToString(resolveColorToken(colorToken('code-color'))),
  ui: colorTokenToString(resolveColorToken(colorToken('body-color')))
} as const;

function font(value: keyof typeof fontSize) {
  let type = value.split('-')[0];
  let size = fontSize[value];
  return {
    fontFamily: fontFamily[type === 'code' ? 'code' : 'sans'],
    '--fs': `pow(1.125, ${size})`,
    fontSize: `round(${fontSizeCalc} / 16 * 1rem, 1px)`,
    fontWeight:
      fontWeight[type === 'heading' || type === 'title' || type === 'detail' ? type : 'normal'],
    lineHeight: lineHeight[type],
    color: fontColor[type as keyof typeof fontColor]
  };
}

function margin(value: keyof typeof marginTop) {
  return {
    marginTop: {
      default: marginTop[value],
      ':first-child': 0
    },
    marginBottom: {
      default: marginBottom[value],
      ':last-child': 0
    }
  };
}
