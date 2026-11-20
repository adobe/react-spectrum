/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {colorToken} from '../../../s2/style/tokens';
import {
  colorTokenToString,
  fontFamily,
  fontSize,
  fontSizeCalc,
  fontWeight,
  lineHeight,
  resolveColorToken
} from '../../../s2/style/spectrum-theme';

const fontColor = {
  body: colorTokenToString(resolveColorToken(colorToken('body-color'))),
  heading: colorTokenToString(resolveColorToken(colorToken('heading-color'))),
  title: colorTokenToString(resolveColorToken(colorToken('title-color'))),
  detail: colorTokenToString(resolveColorToken(colorToken('detail-color'))),
  code: colorTokenToString(resolveColorToken(colorToken('code-color'))),
  ui: colorTokenToString(resolveColorToken(colorToken('body-color')))
} as const;

export function font(value: keyof typeof fontSize) {
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
