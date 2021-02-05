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

let formatterCache = new Map<string, Intl.NumberFormat>();

let supportsSignDisplay = false;
try {
  // @ts-ignore
  supportsSignDisplay = (new Intl.NumberFormat('de-DE', {signDisplay: 'exceptZero'})).resolvedOptions().signDisplay === 'exceptZero';
  // eslint-disable-next-line no-empty
} catch (e) {}

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  /** Overrides default numeral system for the current locale. */
  numberingSystem?: string
}

/**
 * Provides localized number formatting for the current locale. Automatically updates when the locale changes,
 * and handles caching of the number formatter for performance.
 * @param options - Formatting options.
 */
export function getNumberFormatter(locale: string, options: NumberFormatOptions = {}): Intl.NumberFormat {
  let {numberingSystem} = options;
  if (numberingSystem && locale.indexOf('-u-nu-') === -1) {
    locale = `${locale}-u-nu-${numberingSystem}`;
  }

  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : '');
  if (formatterCache.has(cacheKey)) {
    return formatterCache.get(cacheKey);
  }

  let numberFormatter = new Intl.NumberFormat(locale, options);
  // @ts-ignore
  let {signDisplay} = options || {};
  if (!supportsSignDisplay && signDisplay != null) {
    let proxy = new Proxy(numberFormatter, {
      get(target, property) {
        if (property === 'format') {
          return (v) => numberFormatSignDisplayPolyfill(numberFormatter, signDisplay, v);
        } else if (property === 'resolvedOptions') {
          return () => ({...numberFormatter.resolvedOptions(), signDisplay});
        } else {
          return target[property];
        }
      }
    });

    formatterCache.set(cacheKey, proxy);
    return proxy;
  }

  formatterCache.set(cacheKey, numberFormatter);
  return numberFormatter;
}

/** @private - exported for tests */
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
