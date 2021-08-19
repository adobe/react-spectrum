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
const NUMBERING_SYSTEMS = ['latn', 'arab', 'hanidec'];

/**
 * A NumberParser can be used perform locale aware parsing of numbers from Unicode strings,
 * as well as validation of partial user input. Automatically detects the numbering system
 * used in the input, and supports parsing decimals, percentages, currency values, and units
 * according to the locale.
 */
export class NumberParser {
  locale: string;
  options: Intl.NumberFormatOptions;

  constructor(locale: string, options: Intl.NumberFormatOptions = {}) {
    this.locale = locale;
    this.options = options;
  }

  /**
   * Parses the given string to a number. Returns NaN if a valid number could not be parsed.
   */
  parse(value: string): number {
    return getNumberParserImpl(this.locale, this.options, value).parse(value);
  }

  /**
   * Returns whether the given string could potentially be a valid number. This should be used to
   * validate user input as the user types. If a `minValue` or `maxValue` is provided, the validity
   * of the minus/plus sign characters can be checked.
   */
  isValidPartialNumber(value: string, minValue?: number, maxValue?: number): boolean {
    return getNumberParserImpl(this.locale, this.options, value).isValidPartialNumber(value, minValue, maxValue);
  }

  /**
   * Returns a numbering system for which the given string is valid in the current locale.
   * If no numbering system could be detected, the default numbering system for the current
   * locale is returned.
   */
  getNumberingSystem(value: string): string {
    return getNumberParserImpl(this.locale, this.options, value).options.numberingSystem;
  }
}

const numberParserCache = new Map<string, NumberParserImpl>();
function getNumberParserImpl(locale: string, options: Intl.NumberFormatOptions, value: string) {
  // First try the default numbering system for the provided locale
  let defaultParser = getCachedNumberParser(locale, options);

  // If that doesn't match, and the locale doesn't include a hard coded numbering system,
  // try each of the other supported numbering systems until we find one that matches.
  if (!locale.includes('-nu-') && !defaultParser.isValidPartialNumber(value)) {
    for (let numberingSystem of NUMBERING_SYSTEMS) {
      if (numberingSystem !== defaultParser.options.numberingSystem) {
        let parser = getCachedNumberParser(locale + (locale.includes('-u-') ? '-nu-' : '-u-nu-') + numberingSystem, options);
        if (parser.isValidPartialNumber(value)) {
          return parser;
        }
      }
    }
  }

  return defaultParser;
}

function getCachedNumberParser(locale: string, options: Intl.NumberFormatOptions) {
  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : '');
  let parser = numberParserCache.get(cacheKey);
  if (!parser) {
    parser = new NumberParserImpl(locale, options);
    numberParserCache.set(cacheKey, parser);
  }

  return parser;
}

// The actual number parser implementation. Instances of this class are cached
// based on the locale, options, and detected numbering system.
class NumberParserImpl {
  formatter: Intl.NumberFormat;
  options: Intl.ResolvedNumberFormatOptions;
  symbols: Symbols;

  constructor(locale: string, options: Intl.NumberFormatOptions = {}) {
    this.formatter = new Intl.NumberFormat(locale, options);
    this.options = this.formatter.resolvedOptions();
    this.symbols = getSymbols(this.formatter, this.options, options);
  }

  parse(value: string) {
    // to parse the number, we need to remove anything that isn't actually part of the number, for example we want '-10.40' not '-10.40 USD'
    let fullySanitizedValue = this.sanitize(value);

    // Remove group characters, and replace decimal points and numerals with ASCII values.
    fullySanitizedValue = replaceAll(fullySanitizedValue, this.symbols.group, '')
      .replace(this.symbols.decimal, '.')
      .replace(this.symbols.minusSign, '-')
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

    // Replace the ASCII minus sign with the minus sign used in the current locale
    // so that both are allowed in case the user's keyboard doesn't have the locale's minus sign.
    value = value.replace('-', this.symbols.minusSign);

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
    value = this.sanitize(value);

    // Remove minus or plus sign, which must be at the start of the string.
    if (value.startsWith(this.symbols.minusSign) && minValue < 0) {
      value = value.slice(this.symbols.minusSign.length);
    } else if (this.symbols.plusSign && value.startsWith(this.symbols.plusSign) && maxValue > 0) {
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

function getSymbols(formatter: Intl.NumberFormat, intlOptions: Intl.ResolvedNumberFormatOptions, originalOptions: Intl.NumberFormatOptions): Symbols {
  // Note: some locale's don't add a group symbol until there is a ten thousands place
  let allParts = formatter.formatToParts(-10000.111);
  let posAllParts = formatter.formatToParts(10000.111);
  let singularParts = formatter.formatToParts(1);

  let minusSign = allParts.find(p => p.type === 'minusSign')?.value ?? '-';
  let plusSign = posAllParts.find(p => p.type === 'plusSign')?.value;

  // Safari does not support the signDisplay option, but our number parser polyfills it.
  // If no plus sign was returned, but the original options contained signDisplay, default to the '+' character.
  // @ts-ignore
  if (!plusSign && (originalOptions?.signDisplay === 'exceptZero' || originalOptions?.signDisplay === 'always')) {
    plusSign = '+';
  }

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
