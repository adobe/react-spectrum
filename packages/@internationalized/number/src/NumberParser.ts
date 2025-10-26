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

import {NumberFormatter} from './NumberFormatter';

interface Symbols {
  minusSign?: string,
  plusSign?: string,
  decimal?: string,
  group?: string,
  literals: RegExp,
  numeral: RegExp,
  numerals: string[],
  index: (v: string) => string,
  noNumeralUnits: Array<{unit: string, value: number}>
}

const CURRENCY_SIGN_REGEX = new RegExp('^.*\\(.*\\).*$');
const NUMBERING_SYSTEMS = ['latn', 'arab', 'hanidec', 'deva', 'beng', 'fullwide'];

/**
 * A NumberParser can be used to perform locale-aware parsing of numbers from Unicode strings,
 * as well as validation of partial user input. It automatically detects the numbering system
 * used in the input, and supports parsing decimals, percentages, currency values, and units
 * according to the locale.
 */
export class NumberParser {
  private locale: string;
  private options: Intl.NumberFormatOptions;

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
  locale: string;

  constructor(locale: string, options: Intl.NumberFormatOptions = {}) {
    this.locale = locale;
    // see https://tc39.es/ecma402/#sec-setnfdigitoptions, when using roundingIncrement, the maximumFractionDigits and minimumFractionDigits must be equal
    // by default, they are 0 and 3 respectively, so we set them to 0 if neither are set
    if (options.roundingIncrement !== 1 && options.roundingIncrement != null) {
      if (options.maximumFractionDigits == null && options.minimumFractionDigits == null) {
        options.maximumFractionDigits = 0;
        options.minimumFractionDigits = 0;
      } else if (options.maximumFractionDigits == null) {
        options.maximumFractionDigits = options.minimumFractionDigits;
      } else if (options.minimumFractionDigits == null) {
        options.minimumFractionDigits = options.maximumFractionDigits;
      }
      // if both are specified, let the normal Range Error be thrown
    }
    this.formatter = new Intl.NumberFormat(locale, options);
    this.options = this.formatter.resolvedOptions();
    this.symbols = getSymbols(locale, this.formatter, this.options, options);
    if (this.options.style === 'percent' && ((this.options.minimumFractionDigits ?? 0) > 18 || (this.options.maximumFractionDigits ?? 0) > 18)) {
      console.warn('NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.');
    }
  }

  parse(value: string) {
    // to parse the number, we need to remove anything that isn't actually part of the number, for example we want '-10.40' not '-10.40 USD'
    let fullySanitizedValue = this.sanitize(value);

    if (this.symbols.group) {
      // Remove group characters, and replace decimal points and numerals with ASCII values.
      fullySanitizedValue = replaceAll(fullySanitizedValue, this.symbols.group, '');
    }
    if (this.symbols.decimal) {
      fullySanitizedValue = fullySanitizedValue.replace(this.symbols.decimal!, '.');
    }
    if (this.symbols.minusSign) {
      fullySanitizedValue = fullySanitizedValue.replace(this.symbols.minusSign!, '-');
    }
    fullySanitizedValue = fullySanitizedValue.replace(this.symbols.numeral, this.symbols.index);

    if (this.options.style === 'percent') {
      // javascript is bad at dividing by 100 and maintaining the same significant figures, so perform it on the string before parsing
      let isNegative = fullySanitizedValue.indexOf('-');
      fullySanitizedValue = fullySanitizedValue.replace('-', '');
      fullySanitizedValue = fullySanitizedValue.replace('+', '');
      let index = fullySanitizedValue.indexOf('.');
      if (index === -1) {
        index = fullySanitizedValue.length;
      }
      fullySanitizedValue = fullySanitizedValue.replace('.', '');
      if (index - 2 === 0) {
        fullySanitizedValue = `0.${fullySanitizedValue}`;
      } else if (index - 2 === -1) {
        fullySanitizedValue = `0.0${fullySanitizedValue}`;
      } else if (index - 2 === -2) {
        fullySanitizedValue = '0.00';
      } else {
        fullySanitizedValue = `${fullySanitizedValue.slice(0, index - 2)}.${fullySanitizedValue.slice(index - 2)}`;
      }
      if (isNegative > -1) {
        fullySanitizedValue = `-${fullySanitizedValue}`;
      }
    }

    let newValue = fullySanitizedValue ? +fullySanitizedValue : NaN;
    if (isNaN(newValue)) {
      return NaN;
    }

    if (this.options.style === 'percent') {
      // extra step for rounding percents to what our formatter would output
      let options = {
        ...this.options,
        style: 'decimal' as const,
        minimumFractionDigits: Math.min((this.options.minimumFractionDigits ?? 0) + 2, 20),
        maximumFractionDigits: Math.min((this.options.maximumFractionDigits ?? 0) + 2, 20)
      };
      return (new NumberParser(this.locale, options)).parse(new NumberFormatter(this.locale, options).format(newValue));
    }

    // accounting will always be stripped to a positive number, so if it's accounting and has a () around everything, then we need to make it negative again
    if (this.options.currencySign === 'accounting' && CURRENCY_SIGN_REGEX.test(value)) {
      newValue = -1 * newValue;
    }

    return newValue;
  }

  sanitize(value: string) {
    // If the value is only a unit and it matches one of the formatted numbers where the value is part of the unit and doesn't have any numerals, then
    // return the known value for that case.
    if (this.symbols.noNumeralUnits.length > 0 && this.symbols.noNumeralUnits.find(obj => obj.unit === value)) {
      return this.symbols.noNumeralUnits.find(obj => obj.unit === value)!.value.toString();
    }
    // Do our best to preserve the number and its possible group and decimal symbols, this includes the sign as well
    let preservedInsideNumber = value.match(new RegExp(`([${this.symbols.numerals.join('')}].*[${this.symbols.numerals.join('')}])`));
    if (preservedInsideNumber) {
      // If we found a number, replace literals everywhere except inside the number
      let beforeNumber = value.substring(0, preservedInsideNumber.index!);
      let afterNumber = value.substring(preservedInsideNumber.index! + preservedInsideNumber[0].length);
      let insideNumber = preservedInsideNumber[0];

      // Replace literals in the parts outside the number
      beforeNumber = beforeNumber.replace(this.symbols.literals, '');
      afterNumber = afterNumber.replace(this.symbols.literals, '');

      // Reconstruct the value with literals removed from outside the number
      value = beforeNumber + insideNumber + afterNumber;
    } else {
      // If no number found, replace literals everywhere
      value = value.replace(this.symbols.literals, '');
    }


    // Replace the ASCII minus sign with the minus sign used in the current locale
    // so that both are allowed in case the user's keyboard doesn't have the locale's minus sign.
    if (this.symbols.minusSign) {
      value = value.replace('-', this.symbols.minusSign);
    }

    // In arab numeral system, their decimal character is 1643, but most keyboards don't type that
    // instead they use the , (44) character or apparently the (1548) character.
    if (this.options.numberingSystem === 'arab') {
      if (this.symbols.decimal) {
        value = replaceAll(value, ',', this.symbols.decimal);
        value = replaceAll(value, String.fromCharCode(1548), this.symbols.decimal);
      }
      if (this.symbols.group) {
        value = replaceAll(value, '.', this.symbols.group);
      }
    }

    // In some locale styles, such as swiss currency, the group character can be a special single quote
    // that keyboards don't typically have. This expands the character to include the easier to type single quote.
    if (this.symbols.group === '’' && value.includes("'")) {
      value = replaceAll(value, "'", this.symbols.group);
    }

    // fr-FR group character is narrow non-breaking space, char code 8239 (U+202F), but that's not a key on the french keyboard,
    // so allow space and non-breaking space as a group char as well
    if (this.options.locale === 'fr-FR' && this.symbols.group) {
      value = replaceAll(value, ' ', this.symbols.group);
      value = replaceAll(value, /\u00A0/g, this.symbols.group);
    }

    // If there are multiple decimal separators and only one group separator, swap them
    if (this.symbols.decimal
      && this.symbols.group
      && [...value.matchAll(new RegExp(escapeRegex(this.symbols.decimal), 'g'))].length > 1
      && [...value.matchAll(new RegExp(escapeRegex(this.symbols.group), 'g'))].length <= 1) {
      value = swapCharacters(value, this.symbols.decimal, this.symbols.group);
    }

    // If the decimal separator is before the group separator, swap them
    let decimalIndex = value.indexOf(this.symbols.decimal!);
    let groupIndex = value.indexOf(this.symbols.group!);
    if (this.symbols.decimal && this.symbols.group && decimalIndex > -1 && groupIndex > -1 && decimalIndex < groupIndex) {
      value = swapCharacters(value, this.symbols.decimal, this.symbols.group);
    }

    // in the value, for any non-digits and not the plus/minus sign,
    // if there is only one of that character and its index in the string is 0 or it's only preceeded by this numbering system's "0" character,
    // then we could try to guess that it's a decimal character and replace it, but it's too ambiguous, a user may be deleting 1,024 -> ,024 and
    // we don't want to change 24 into .024
    let temp = value;
    if (this.symbols.minusSign) {
      temp = replaceAll(temp, this.symbols.minusSign, '');
      temp = replaceAll(temp, '\u2212', '');
    }
    if (this.symbols.plusSign) {
      temp = replaceAll(temp, this.symbols.plusSign, '');
    }
    temp = replaceAll(temp, new RegExp(`^${escapeRegex(this.symbols.numerals[0])}+`, 'g'), '');
    let nonDigits = new Set(replaceAll(temp, this.symbols.numeral, '').split(''));

    // This is to fuzzy match group and decimal symbols from a different formatting, we can only do it if there are 2 non-digits, otherwise it's too ambiguous
    let areOnlyGroupAndDecimalSymbols = [...nonDigits].every(char => allPossibleGroupAndDecimalSymbols.has(char));
    let oneSymbolNotMatching = (
      nonDigits.size === 2
      && this.symbols.group
      && this.symbols.decimal
      && (!nonDigits.has(this.symbols.group!) || !nonDigits.has(this.symbols.decimal!))
    );
    let bothSymbolsNotMatching = (
      nonDigits.size === 2
      && this.symbols.group
      && this.symbols.decimal
      && !nonDigits.has(this.symbols.group!) && !nonDigits.has(this.symbols.decimal!)
    );
    if (areOnlyGroupAndDecimalSymbols && (oneSymbolNotMatching || bothSymbolsNotMatching)) {
      // Try to determine which of the nonDigits is the group and which is the decimal
      // Whichever of the nonDigits is first in the string is the group.
      // If there are more than one of a nonDigit, then that one is the group.
      let [firstChar, secondChar] = [...nonDigits];
      if (value.indexOf(firstChar) < value.indexOf(secondChar)) {
        value = replaceAll(value, firstChar, '__GROUP__');
        value = replaceAll(value, secondChar, '__DECIMAL__');
        value = replaceAll(value, '__GROUP__', this.symbols.group!);
        value = replaceAll(value, '__DECIMAL__', this.symbols.decimal!);
      } else {
        value = replaceAll(value, secondChar, '__GROUP__');
        value = replaceAll(value, firstChar, '__DECIMAL__');
        value = replaceAll(value, '__GROUP__', this.symbols.group!);
        value = replaceAll(value, '__DECIMAL__', this.symbols.decimal!);
      }
    }

    return value;
  }

  isValidPartialNumber(value: string, minValue: number = -Infinity, maxValue: number = Infinity): boolean {
    value = this.sanitize(value);

    // Remove minus or plus sign, which must be at the start of the string.
    if (this.symbols.minusSign && value.startsWith(this.symbols.minusSign) && minValue < 0) {
      value = value.slice(this.symbols.minusSign.length);
    } else if (this.symbols.plusSign && value.startsWith(this.symbols.plusSign) && maxValue > 0) {
      value = value.slice(this.symbols.plusSign.length);
    }

    // Numbers that can't have any decimal values fail if a decimal character is typed
    if (this.symbols.decimal && value.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0) {
      return false;
    }

    // Remove numerals, groups, and decimals
    if (this.symbols.group) {
      value = replaceAll(value, this.symbols.group, '');
    }
    value = value.replace(this.symbols.numeral, '');
    if (this.symbols.decimal) {
      value = value.replace(this.symbols.decimal, '');
    }

    // The number is valid if there are no remaining characters
    return value.length === 0;
  }
}

const nonLiteralParts = new Set(['decimal', 'fraction', 'integer', 'minusSign', 'plusSign', 'group']);

// This list is a best guess at the moment
const allPossibleGroupAndDecimalSymbols = new Set(['.', ',', ' ', String.fromCharCode(1548), '\u00A0', "'"]);

// This list is derived from https://www.unicode.org/cldr/charts/43/supplemental/language_plural_rules.html#comparison and includes
// all unique numbers which we need to check in order to determine all the plural forms for a given locale.
// See: https://github.com/adobe/react-spectrum/pull/5134/files#r1337037855 for used script
const pluralNumbers = [
  0, 4, 2, 1, 11, 20, 3, 7, 100, 21, 0.1, 1.1
];

function getSymbols(locale: string, formatter: Intl.NumberFormat, intlOptions: Intl.ResolvedNumberFormatOptions, originalOptions: Intl.NumberFormatOptions): Symbols {
  // formatter needs access to all decimal places in order to generate the correct literal strings for the plural set
  let symbolFormatter = new Intl.NumberFormat(locale, {...intlOptions,
    // Resets so we get the full range of symbols
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 21,
    roundingIncrement: 1,
    roundingPriority: 'auto',
    roundingMode: 'halfExpand'
  });
  // Note: some locale's don't add a group symbol until there is a ten thousands place
  let allParts = symbolFormatter.formatToParts(-10000.111);
  let posAllParts = symbolFormatter.formatToParts(10000.111);
  let pluralParts = pluralNumbers.map(n => symbolFormatter.formatToParts(n));
  // if the plural parts include a unit but no integer or fraction, then we need to add the unit to the special set
  let noNumeralUnits = pluralParts.map((p, i) => {
    let unit = p.find(p => p.type === 'unit');
    if (unit && !p.some(p => p.type === 'integer' || p.type === 'fraction')) {
      return {unit: unit.value, value: pluralNumbers[i]};
    }
    return null;
  }).filter(p => !!p);

  let minusSign = allParts.find(p => p.type === 'minusSign')?.value ?? '-';
  let plusSign = posAllParts.find(p => p.type === 'plusSign')?.value;

  // Safari does not support the signDisplay option, but our number parser polyfills it.
  // If no plus sign was returned, but the original options contained signDisplay, default to the '+' character.
  if (!plusSign && (originalOptions?.signDisplay === 'exceptZero' || originalOptions?.signDisplay === 'always')) {
    plusSign = '+';
  }

  // If maximumSignificantDigits is 1 (the minimum) then we won't get decimal characters out of the above formatters
  // Percent also defaults to 0 fractionDigits, so we need to make a new one that isn't percent to get an accurate decimal
  let decimalParts = new Intl.NumberFormat(locale, {...intlOptions, minimumFractionDigits: 2, maximumFractionDigits: 2}).formatToParts(0.001);

  let decimal = decimalParts.find(p => p.type === 'decimal')?.value;
  let group = allParts.find(p => p.type === 'group')?.value;

  // this set is also for a regex, it's all literals that might be in the string we want to eventually parse that
  // don't contribute to the numerical value
  let allPartsLiterals = allParts.filter(p => !nonLiteralParts.has(p.type)).map(p => escapeRegex(p.value));
  let pluralPartsLiterals = pluralParts.flatMap(p => p.filter(p => !nonLiteralParts.has(p.type)).map(p => escapeRegex(p.value)));
  let sortedLiterals = [...new Set([...allPartsLiterals, ...pluralPartsLiterals])].sort((a, b) => b.length - a.length);

  // Match both whitespace and formatting characters
  let literals = sortedLiterals.length === 0 ?
      new RegExp('\\p{White_Space}|\\p{Cf}', 'gu') :
      new RegExp(`${sortedLiterals.join('|')}|\\p{White_Space}|\\p{Cf}`, 'gu');

  // These are for replacing non-latn characters with the latn equivalent
  let numerals = [...new Intl.NumberFormat(intlOptions.locale, {useGrouping: false}).format(9876543210)].reverse();
  let indexes = new Map(numerals.map((d, i) => [d, i]));
  let numeral = new RegExp(`[${numerals.join('')}]`, 'g');
  let index = d => String(indexes.get(d));

  return {minusSign, plusSign, decimal, group, literals, numeral, numerals, index, noNumeralUnits};
}

function swapCharacters(str: string, char1: string, char2: string) {
  const tempChar = '_TEMP_';
  let result = str.replaceAll(char1, tempChar);
  result = result.replaceAll(char2, char1);
  result = result.replaceAll(tempChar, char2);
  return result;
}

function replaceAll(str: string, find: string | RegExp, replace: string) {
  if (str.replaceAll) {
    return str.replaceAll(find, replace);
  }

  return str.split(find).join(replace);
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
