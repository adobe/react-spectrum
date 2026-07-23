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

import {colorToken, getToken} from '../../../s2/style/tokens' with {type: 'macro'};
import {
  colorTokenToString,
  fontFamily,
  fontSize,
  fontSizeCalc,
  fontWeight,
  lineHeight,
  resolveColorToken,
  space
} from '../../../s2/style/spectrum-theme' with {type: 'macro'};

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
    '.prose': font('body'), // note: `prose` is a placeholder class name that is replaced with a hashed class name below
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
      borderInlineStartWidth: getToken('border-width-200'),
      // Padding uses px, spacing (margin) uses rem — matching the style macro's maps.
      paddingInlineStart: '12px',
      marginInlineStart: space(4)
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
      borderWidth: getToken('border-width-100'),
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
      width: '100%'
    },
    thead: {
      backgroundColor: colorTokenToString(resolveColorToken(colorToken('gray-75'))),
      // `borderTopRadius` isn't a real CSS property; the style macro expands it into
      // the two top logical-corner properties, so do the same here.
      borderStartStartRadius: getToken('corner-radius-medium-default'),
      borderStartEndRadius: getToken('corner-radius-medium-default')
    },
    th: {
      paddingInline: '16px',
      textAlign: 'start',
      fontWeight: 'bold',
      borderColor: colorTokenToString(resolveColorToken(colorToken('gray-300'))),
      borderWidth: 0,
      borderBottomWidth: getToken('border-width-100'),
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

  // Emit the declarations (and any conditional sub-rules) for a single element,
  // indented by `indent`. Nested `&`-conditions are relative to the enclosing rule.
  let emitProperties = (properties: Record<string, any>, indent: string) => {
    let css = '';
    for (let property in properties) {
      let value = properties[property];
      let prop = property.replace(/([a-z])([A-Z])/g, (_, a, b) => `${a}-${b.toLowerCase()}`);
      if (typeof value === 'object') {
        if (value.default) {
          css += `${indent}${prop}: ${value.default};\n`;
        }
        for (let condition in value) {
          // eslint-disable-next-line max-depth
          if (condition === 'default') {
            continue;
          }
          css += `${indent}${condition.startsWith(':') ? '&' : ''}${condition} { ${prop}: ${value[condition]}; }\n`;
        }
      } else {
        css += `${indent}${prop}: ${value};\n`;
      }
    }
    return css;
  };

  let css = '.prose {\n';
  for (let key in rules) {
    let properties = rules[key];
    if (key === '.prose') {
      css += emitProperties(properties, '  ');
    } else {
      css += `  ${key} {\n`;
      css += emitProperties(properties, '    ');
      css += '  }\n';
    }
  }
  css += '}\n';

  let hashedRoot = toBase62(hash(css));
  css = css.replaceAll('prose', `${hashedRoot}`);

  // The prose layer is always lower priority than the style macro layers.
  css = `
@layer _.prose {
  ${css}
}`;

  this?.addAsset({
    type: 'css',
    content: css
  });

  return hashedRoot;
}

// Generate a class name from a number, e.g. index within the theme.
// This maps to an alphabet containing lower case letters, upper case letters, and numbers.
// For numbers larger than 62, an underscore is prepended.
// This encoding allows easy parsing to enable runtime merging by property.
function generateName(index: number, atStart = false): string {
  if (index < 26) {
    // lower case letters
    return String.fromCharCode(index + 97);
  }

  if (index < 52) {
    // upper case letters
    return String.fromCharCode(index - 26 + 65);
  }

  if (index < 62 && !atStart) {
    // numbers
    return String.fromCharCode(index - 52 + 48);
  }

  return '_' + generateName(index - (atStart ? 52 : 62));
}

function toBase62(value: number) {
  if (value === 0) {
    return generateName(value, true);
  }

  let res = '';
  let atStart = true;
  while (value) {
    let remainder = value % 62;
    res += generateName(remainder, atStart);
    atStart = false;
    value = Math.floor((value - remainder) / 62);
  }

  return res;
}

// djb2 hash function.
// http://www.cse.yorku.ca/~oz/hash.html
function hash(v: string) {
  let hash = 5381;
  for (let i = 0; i < v.length; i++) {
    hash = ((hash << 5) + hash + v.charCodeAt(i)) >>> 0;
  }
  return hash;
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
