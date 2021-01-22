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

import {getNumberingSystem} from './numberingSystems';

interface Symbols {
  minusSign: string,
  plusSign: string,
  decimal: string,
  group: string,
  literals: RegExp,
  numeral: RegExp,
  index: (v: string) => string
}

const CURRENCY_SIGN_REGEX = new RegExp('^.*\\(.*\\).*$');

export function parseNumber(locale: string, options: Intl.NumberFormatOptions, value: string) {
  return getNumberParser(locale, options, value).parse(value);
}

export function isValidPartialNumber(locale: string, options: Intl.NumberFormatOptions, value: string, minValue?: number, maxValue?: number) {
  return getNumberParser(locale, options, value).isValidPartialNumber(value, minValue, maxValue);
}

const numberParserCache = new Map<string, NumberParser>();
function getNumberParser(locale: string, options: Intl.NumberFormatOptions, value: string) {
  if (!locale.includes('-u-nu-')) {
    let numberingSystem = getNumberingSystem(value);
    if (numberingSystem) {
      locale = `${locale}-u-nu-${numberingSystem}`;
    }
  }

  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : '');
  let parser = numberParserCache.get(cacheKey);
  if (!parser) {
    parser = new NumberParser(locale, options);
    numberParserCache.set(cacheKey, parser);
  }

  return parser;
}

class NumberParser {
  formatter: Intl.NumberFormat;
  options: Intl.ResolvedNumberFormatOptions;
  symbols: Symbols;

  constructor(locale: string, options: Intl.NumberFormatOptions = {}) {
    this.formatter = new Intl.NumberFormat(locale, options);
    this.options = this.formatter.resolvedOptions();
    this.symbols = getSymbols(this.formatter, this.options);
  }

  parse(value: string) {
    // assuming a clean string
    // to parse the number, we need to remove anything that isn't actually part of the number, for example we want '-10.40' not '-10.40 USD'
    let fullySanitizedValue = this.sanitize(value);

    // first match the prefix/suffix wrapper of everything that isn't a number
    // then preserve that as we'll need to put it back together as the current input value
    // with the actual numerals, parse them into a number
    fullySanitizedValue = replaceAll(fullySanitizedValue, this.symbols.group, '')
      .replace(this.symbols.decimal, '.')
      .replace(this.symbols.numeral, this.symbols.index);

    let newValue = fullySanitizedValue ? +fullySanitizedValue : NaN;
    if (isNaN(newValue)) {
      return NaN;
    }

    // accounting will always be stripped to a positive number, so if it's accounting and has a () around everything, then we need to make it negative again
    if (this.options.currencySign === 'accounting' && CURRENCY_SIGN_REGEX.test(value)) {
      newValue = -1 * newValue;
    }

    // when reading the number, if it's a percent, then it should be interpreted as being divided by 100
    if (this.options.style === 'percent') {
      newValue /= 100;
      // after dividing to get the percent value, javascript may get .0210999999 instead of .0211, so fix the number of fraction digits
      newValue = +newValue.toFixed((this.options.maximumFractionDigits ?? 0) + 2);
    }

    return newValue;
  }

  sanitize(value: string) {
    // Remove literals and whitespace, which are allowed anywhere in the string
    value = value.replace(this.symbols.literals, '');

    // In arab numeral system, their decimal character is 1643, but most keyboards don't type that
    // instead they use the , (44) character or apparently the (1548) character.
    if (this.options.numberingSystem === 'arab') {
      value = value.replace(',', this.symbols.decimal);
      value = value.replace(String.fromCharCode(1548), this.symbols.decimal);
      value = replaceAll(value, '.', this.symbols.group);
    }

    // fr-FR group character is char code 8239, but that's not a key on the french keyboard,
    // so allow 'period' as a group char and replace it with a space
    if (this.options.locale === 'fr-FR') {
      value = replaceAll(value, '.', String.fromCharCode(8239));
    }

    return value;
  }

  isValidPartialNumber(value: string, minValue: number = -Infinity, maxValue: number = Infinity): boolean {
    // Remove literals and whitespace, which are allowed anywhere in the string
    value = this.sanitize(value);

    // Remove minus or plus sign, which must be at the start of the string.
    if (value.startsWith(this.symbols.minusSign) && minValue < 0) {
      value = value.slice(this.symbols.minusSign.length);
    } else if (value.startsWith(this.symbols.plusSign) && maxValue > 0) {
      value = value.slice(this.symbols.plusSign.length);
    }

    // Numbers cannot start with a group separator
    if (value.startsWith(this.symbols.group)) {
      return false;
    }

    // Remove numerals, groups, and decimals
    value = replaceAll(value, this.symbols.group, '')
      .replace(this.symbols.numeral, '')
      .replace(this.symbols.decimal, '');

    // The number is valid if there are no remaining characters
    return value.length === 0;
  }
}

const nonLiteralParts = new Set(['decimal', 'fraction', 'integer', 'minusSign', 'plusSign', 'group']);

function getSymbols(formatter: Intl.NumberFormat, intlOptions: Intl.ResolvedNumberFormatOptions): Symbols {
  // Note: some locale's don't add a group symbol until there is a ten thousands place
  let allParts = formatter.formatToParts(-10000.1);
  let minusSign = allParts.find(p => p.type === 'minusSign')?.value;
  let posAllParts = formatter.formatToParts(10000.1);
  let plusSign = posAllParts.find(p => p.type === 'plusSign')?.value;
  let singularParts = formatter.formatToParts(1);

  let decimal = allParts.find(p => p.type === 'decimal')?.value;
  let group = allParts.find(p => p.type === 'group')?.value;

  // this set is also for a regex, it's all literals that might be in the string we want to eventually parse that
  // don't contribute to the numerical value
  let pluralLiterals = allParts.filter(p => !nonLiteralParts.has(p.type)).map(p => escapeRegex(p.value));
  let singularLiterals = singularParts.filter(p => !nonLiteralParts.has(p.type)).map(p => escapeRegex(p.value));
  let sortedLiterals = [...new Set([...singularLiterals, ...pluralLiterals])].sort((a, b) => b.length - a.length);
  let literals = new RegExp(`${sortedLiterals.join('|')}|[\\p{White_Space}]`, 'gu');

  // These are for replacing non-latn characters with the latn equivalent
  let numerals = [...new Intl.NumberFormat(intlOptions.locale, {useGrouping: false}).format(9876543210)].reverse();
  let indexes = new Map(numerals.map((d, i) => [d, i]));
  let numeral = new RegExp(`[${numerals.join('')}]`, 'g');
  let index = d => String(indexes.get(d));

  return {minusSign, plusSign, decimal, group, literals, numeral, index};
}

function replaceAll(str: string, find: string, replace: string) {
  // @ts-ignore
  if (str.replaceAll) {
    // @ts-ignore
    return str.replaceAll(find, replace);
  }

  return str.split(find).join(replace);
}

function escapeRegex(string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
