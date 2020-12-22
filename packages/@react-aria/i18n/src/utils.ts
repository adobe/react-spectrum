/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// https://en.wikipedia.org/wiki/Right-to-left
const RTL_SCRIPTS = new Set(['Arab', 'Syrc', 'Samr', 'Mand', 'Thaa', 'Mend', 'Nkoo', 'Adlm', 'Rohg', 'Hebr']);
const RTL_LANGS = new Set(['ae', 'ar', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk', 'he', 'ku', 'mzn', 'nqo', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi']);

/**
 * Determines if a locale is read right to left using [Intl.Locale]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale}.
 */
export function isRTL(locale: string) {
  // If the Intl.Locale API is available, use it to get the script for the locale.
  // This is more accurate than guessing by language, since languages can be written in multiple scripts.
  // @ts-ignore
  if (Intl.Locale) {
    // @ts-ignore
    let script = new Intl.Locale(locale).maximize().script;
    return RTL_SCRIPTS.has(script);
  }

  // If not, just guess by the language (first part of the locale)
  let lang = locale.split('-')[0];
  return RTL_LANGS.has(lang);
}

export function numberFormatSignDisplayPolyfill(numberFormat: Intl.NumberFormat, signDisplay: 'always' | 'exceptZero' | 'auto' | 'never', num: number) {
  if (signDisplay === 'auto') {
    return numberFormat.format(num);
  } else if (signDisplay === 'never') {
    return numberFormat.format(Math.abs(num));
  } else {
    let needsPositiveSign = false;
    if (signDisplay === 'always') {
      needsPositiveSign = num > 0 || Object.is(num, 0);
    } else if (signDisplay === 'exceptZero') {
      if (Object.is(num, -0) || Object.is(num, 0)) {
        num = Math.abs(num);
      } else {
        needsPositiveSign = num > 0;
      }
    }

    if (needsPositiveSign) {
      let negative = numberFormat.format(-num);
      let noSign = numberFormat.format(num);
      // ignore RTL/LTR marker character
      let minus = negative.replace(noSign, '').replace(/\u200e|\u061C/, '');
      if ([...minus].length !== 1) {
        console.warn('@react-aria/i18n polyfill for NumberFormat signDisplay: Unsupported case');
      }
      let positive = negative.replace(noSign, '!!!').replace(minus, '+').replace('!!!', noSign);
      return positive;
    } else {
      return numberFormat.format(num);
    }
  }
}
