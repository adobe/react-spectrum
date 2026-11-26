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

interface CompactSymbol {
  /** The power of ten that the symbol represents, e.g. 3 for "K" in "1.5K". */
  exponent: number;
  /** Whether the symbol is displayed before the number. */
  prefix: boolean;
  /** Whether the same text is also used as another literal, such as a currency symbol. */
  literal: boolean;
}

interface Symbols {
  minusSign?: string;
  plusSign?: string;
  decimal?: string;
  group?: string;
  literals: RegExp;
  numeral: RegExp;
  numerals: string[];
  index: (v: string) => string;
  noNumeralUnits: Array<{unit: string; value: number}>;
  exponentSeparator?: string;
  exponentMinusSign?: string;
  compact: Map<string, CompactSymbol>;
}

const CURRENCY_SIGN_REGEX = new RegExp('^.*\\(.*\\).*$');
const NUMBERING_SYSTEMS = ['latn', 'arab', 'hanidec', 'deva', 'beng', 'fullwide'];

/**
 * A NumberParser can be used to perform locale-aware parsing of numbers from Unicode strings,
 * as well as validation of partial user input. It automatically detects the numbering system
 * used in the input, and supports parsing decimals, percentages, currency values, and units
 * according to the locale, including compact, scientific, and engineering notation.
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
    return getNumberParserImpl(this.locale, this.options, value).isValidPartialNumber(
      value,
      minValue,
      maxValue
    );
  }

  /**
   * Returns a numbering system for which the given string is valid in the current locale.
   * If no numbering system could be detected, the default numbering system for the current
   * locale is returned.
   */
  getNumberingSystem(value: string): string {
    let parser = getNumberParserImpl(this.locale, this.options, value);
    let sanitizedValue = parser.sanitize(value).value;

    // Without numerals or a supported decimal separator, the input does not identify a numbering system.
    if (
      sanitizedValue.search(parser.symbols.numeral) === -1 &&
      (!parser.symbols.decimal || !sanitizedValue.includes(parser.symbols.decimal))
    ) {
      return getCachedNumberParser(this.locale, this.options).options.numberingSystem;
    }

    return parser.options.numberingSystem;
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
        let parser = getCachedNumberParser(
          locale + (locale.includes('-u-') ? '-nu-' : '-u-nu-') + numberingSystem,
          options
        );
        if (parser.isValidPartialNumber(value)) {
          return parser;
        }
      }
    }
  }

  return defaultParser;
}

function getCachedNumberParser(locale: string, options: Intl.NumberFormatOptions) {
  let cacheKey =
    locale +
    (options
      ? Object.entries(options)
          .sort((a, b) => (a[0] < b[0] ? -1 : 1))
          .join()
      : '');
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
    if (
      this.options.style === 'percent' &&
      ((this.options.minimumFractionDigits ?? 0) > 18 ||
        (this.options.maximumFractionDigits ?? 0) > 18)
    ) {
      console.warn(
        'NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.'
      );
    }
  }

  parse(value: string): number {
    let number = this.parseUnrounded(value);
    // Round percentages to the precision displayed by the formatter.
    if (this.options.style === 'percent' && !isNaN(number)) {
      number = this.parseUnrounded(this.formatter.format(number));
    }
    return number;
  }

  private parseUnrounded(value: string): number {
    let isGroupSymbolAllowed = this.formatter.resolvedOptions().useGrouping;
    // to parse the number, we need to remove anything that isn't actually part of the number, for example we want '-10.40' not '-10.40 USD'
    let {value: fullySanitizedValue, compactExponent} = this.sanitize(value);
    if (!this.isValidNotation(fullySanitizedValue, compactExponent, false)) {
      return NaN;
    }

    // Return NaN if there is a group symbol but useGrouping is false
    if (
      !isGroupSymbolAllowed &&
      this.symbols.group &&
      fullySanitizedValue.includes(this.symbols.group)
    ) {
      return NaN;
    } else if (this.symbols.group) {
      fullySanitizedValue = fullySanitizedValue.replaceAll(this.symbols.group!, '');
    }

    // Reject any remaining "." when it is not the locale's decimal separator,
    // so Number() cannot interpret invalid punctuation as a decimal point.
    if (this.symbols.decimal !== '.' && fullySanitizedValue.includes('.')) {
      return NaN;
    }

    if (this.symbols.decimal) {
      fullySanitizedValue = fullySanitizedValue.replace(this.symbols.decimal!, '.');
    }
    if (this.symbols.exponentSeparator) {
      fullySanitizedValue = fullySanitizedValue.replace(this.symbols.exponentSeparator, 'e');
    }
    if (this.symbols.minusSign) {
      fullySanitizedValue = replaceAll(fullySanitizedValue, this.symbols.minusSign, '-');
    }
    if (this.symbols.exponentMinusSign) {
      fullySanitizedValue = replaceAll(fullySanitizedValue, this.symbols.exponentMinusSign, '-');
    }
    fullySanitizedValue = fullySanitizedValue.replace(this.symbols.numeral, this.symbols.index);

    let exponent = compactExponent;
    if (this.options.style === 'percent') {
      exponent -= 2;
      // Preserve incomplete percent input containing only a sign or decimal separator as zero.
      if (/^[+-]?\.?$/.test(fullySanitizedValue)) {
        fullySanitizedValue = fullySanitizedValue.startsWith('-') ? '-0' : '0';
      }
    }
    fullySanitizedValue = scaleByPowerOfTen(fullySanitizedValue, exponent);

    let newValue = fullySanitizedValue ? +fullySanitizedValue : NaN;
    if (isNaN(newValue)) {
      return NaN;
    }

    // accounting will always be stripped to a positive number, so if it's accounting and has a () around everything, then we need to make it negative again
    if (this.options.currencySign === 'accounting' && CURRENCY_SIGN_REGEX.test(value)) {
      newValue = -1 * newValue;
    }
    return newValue;
  }

  sanitize(value: string): {value: string; compactExponent: number} {
    let isGroupSymbolAllowed = this.formatter.resolvedOptions().useGrouping;
    // If the value is only a unit and it matches one of the formatted numbers where the value is part of the unit and doesn't have any numerals, then
    // return the known value for that case.
    let noNumeralUnit = this.symbols.noNumeralUnits.find(obj => obj.unit === value);
    if (noNumeralUnit) {
      return {value: noNumeralUnit.value.toString(), compactExponent: 0};
    }

    let compactExponent = this.getCompactExponent(value);
    value = value.replace(this.symbols.literals, '');

    // Replace the ASCII minus sign with the minus sign used in the current locale
    // so that both are allowed in case the user's keyboard doesn't have the locale's minus sign.
    if (this.symbols.minusSign) {
      value = value.replace('-', this.symbols.minusSign);
    }

    // Accept keyboard alternatives for the Arabic decimal separator without replacing other native decimals.
    if (this.options.numberingSystem === 'arab' && this.symbols.decimal === '\u066B') {
      value = replaceAll(value, ',', this.symbols.decimal);
      value = replaceAll(value, '\u060C', this.symbols.decimal);
      if (this.symbols.group && isGroupSymbolAllowed) {
        value = replaceAll(value, '.', this.symbols.group);
      }
    }

    // In some locale styles, such as swiss currency, the group character can be a special single quote
    // that keyboards don't typically have. This expands the character to include the easier to type single quote.
    if (this.symbols.group === '’' && value.includes("'") && isGroupSymbolAllowed) {
      value = replaceAll(value, "'", this.symbols.group);
    }

    // On newer ICU versions, the special single quote has been normalized, so we need to backport.
    if (this.symbols.group === "'" && value.includes('’') && isGroupSymbolAllowed) {
      value = replaceAll(value, '’', this.symbols.group);
    }

    // fr-FR group character is narrow non-breaking space, char code 8239 (U+202F), but that's not a key on the french keyboard,
    // so allow space and non-breaking space as a group char as well
    if (this.options.locale === 'fr-FR' && this.symbols.group && isGroupSymbolAllowed) {
      value = replaceAll(value, ' ', this.symbols.group);
      value = replaceAll(value, /\u00A0/g, this.symbols.group);
    }

    return {value, compactExponent};
  }

  /**
   * Returns the power of ten represented by the compact symbol in the value (e.g. 3 for "1.5K"),
   * 0 if there is none, or NaN if compact symbols are misplaced or repeated.
   */
  private getCompactExponent(value: string): number {
    if (this.symbols.compact.size === 0) {
      return 0;
    }

    let numberStart = value.search(this.symbols.numeral);
    let exponents: number[] = [];
    for (let match of value.matchAll(this.symbols.literals)) {
      let compact = this.symbols.compact.get(match[0]);
      if (!compact) {
        continue;
      }
      let isPrefix = match.index < numberStart;
      if (compact.prefix === isPrefix) {
        exponents.push(compact.exponent);
      } else if (!compact.literal) {
        // A misplaced compact symbol is only allowed when it is also another literal, e.g. a currency symbol.
        return NaN;
      }
    }

    return exponents.length > 1 ? NaN : (exponents[0] ?? 0);
  }

  /** Validates the compact symbol and exponent (e.g. "E3") of a sanitized value. */
  private isValidNotation(value: string, compactExponent: number, isPartial: boolean): boolean {
    if (
      isNaN(compactExponent) ||
      (compactExponent !== 0 && value.search(this.symbols.numeral) === -1)
    ) {
      return false;
    }

    let {exponentSeparator} = this.symbols;
    if (exponentSeparator && value.includes(exponentSeparator)) {
      let parts = value.split(exponentSeparator);
      return (
        parts.length === 2 &&
        parts[0].search(this.symbols.numeral) !== -1 &&
        this.isValidExponent(parts[1], isPartial)
      );
    }

    return true;
  }

  private isValidExponent(value: string, isPartial: boolean): boolean {
    let minusSign = this.symbols.exponentMinusSign ?? '-';
    if (value.startsWith(minusSign)) {
      value = value.slice(minusSign.length);
    } else if (value.startsWith('+') || value.startsWith('-')) {
      value = value.slice(1);
    }
    return (isPartial || value.length > 0) && value.replace(this.symbols.numeral, '').length === 0;
  }

  isValidPartialNumber(
    value: string,
    minValue: number = -Infinity,
    maxValue: number = Infinity
  ): boolean {
    let isGroupSymbolAllowed = this.formatter.resolvedOptions().useGrouping;
    let {value: sanitizedValue, compactExponent} = this.sanitize(value);
    if (!this.isValidNotation(sanitizedValue, compactExponent, true)) {
      return false;
    }

    // The notation is valid, so only the significand remains to be checked, e.g. "1.5" in "1.5E3".
    value = this.symbols.exponentSeparator
      ? sanitizedValue.split(this.symbols.exponentSeparator)[0]
      : sanitizedValue;

    // Remove minus or plus sign, which must be at the start of the string.
    if (this.symbols.minusSign && value.startsWith(this.symbols.minusSign) && minValue < 0) {
      value = value.slice(this.symbols.minusSign.length);
    } else if (this.symbols.plusSign && value.startsWith(this.symbols.plusSign) && maxValue > 0) {
      value = value.slice(this.symbols.plusSign.length);
    }

    // Numbers that can't have any decimal values fail if a decimal character is typed.
    // Significant digits can still allow decimals, e.g. "1.5K" in compact notation.
    if (
      this.symbols.decimal &&
      value.indexOf(this.symbols.decimal) > -1 &&
      this.options.maximumFractionDigits === 0 &&
      this.options.maximumSignificantDigits == null
    ) {
      return false;
    }

    // Remove numerals, groups, and decimals
    if (this.symbols.group && isGroupSymbolAllowed) {
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

const nonLiteralParts = new Set([
  'decimal',
  'fraction',
  'integer',
  'minusSign',
  'plusSign',
  'group',
  'compact',
  'exponentSeparator',
  'exponentInteger',
  'exponentMinusSign'
]);

// This list is derived from https://www.unicode.org/cldr/charts/49/supplemental/language_plural_rules.html#comparison and includes
// all unique numbers which we need to check in order to determine all the plural forms for a given locale.
// Run scripts/generateAllPlurals.mjs to generate this list.
const pluralNumbers = [0, 4, 2, 1, 11, 20, 3, 7, 100, 21, 0.1, 1.1];

function getSymbols(
  locale: string,
  formatter: Intl.NumberFormat,
  intlOptions: Intl.ResolvedNumberFormatOptions,
  originalOptions: Intl.NumberFormatOptions
): Symbols {
  // formatter needs access to all decimal places in order to generate the correct literal strings for the plural set
  let symbolFormatter = new Intl.NumberFormat(locale, {
    ...intlOptions,
    // Resets so we get the full range of symbols
    minimumSignificantDigits: 1,
    maximumSignificantDigits: 21,
    roundingIncrement: 1,
    roundingPriority: 'auto',
    roundingMode: 'halfExpand',
    useGrouping: true,
    notation: 'standard'
  });
  // Note: some locale's don't add a group symbol until there is a ten thousands place
  let allParts = symbolFormatter.formatToParts(-10000.111);
  let posAllParts = symbolFormatter.formatToParts(10000.111);
  let pluralParts = pluralNumbers.map(n => symbolFormatter.formatToParts(n));
  // if the plural parts include a unit but no integer or fraction, then we need to add the unit to the special set
  let noNumeralUnits = pluralParts
    .map((p, i) => {
      let unit = p.find(p => p.type === 'unit');
      if (unit && !p.some(p => p.type === 'integer' || p.type === 'fraction')) {
        return {unit: unit.value, value: pluralNumbers[i]};
      }
      return null;
    })
    .filter(p => !!p);

  let minusSign = allParts.find(p => p.type === 'minusSign')?.value ?? '-';
  let plusSign = posAllParts.find(p => p.type === 'plusSign')?.value;

  // Safari does not support the signDisplay option, but our number parser polyfills it.
  // If no plus sign was returned, but the original options contained signDisplay, default to the '+' character.
  if (
    !plusSign &&
    (originalOptions?.signDisplay === 'exceptZero' || originalOptions?.signDisplay === 'always')
  ) {
    plusSign = '+';
  }

  // If maximumSignificantDigits is 1 (the minimum) then we won't get decimal characters out of the above formatters
  // Percent also defaults to 0 fractionDigits, so we need to make a new one that isn't percent to get an accurate decimal
  let decimalParts = new Intl.NumberFormat(locale, {
    ...intlOptions,
    notation: 'standard',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).formatToParts(0.001);

  let decimal = decimalParts.find(p => p.type === 'decimal')?.value;
  let group = allParts.find(p => p.type === 'group')?.value;

  // Format a negative exponent, e.g. "1E-3", to find the exponent symbols.
  let exponentParts =
    intlOptions.notation === 'scientific' || intlOptions.notation === 'engineering'
      ? formatter.formatToParts(0.001)
      : [];
  let exponentSeparator = exponentParts.find(p => p.type === 'exponentSeparator')?.value;
  let exponentMinusSign = exponentParts.find(p => p.type === 'exponentMinusSign')?.value;

  // These are for replacing non-latn characters with the latn equivalent
  let numerals = [
    ...new Intl.NumberFormat(intlOptions.locale, {useGrouping: false}).format(9876543210)
  ].reverse();
  let indexes = new Map(numerals.map((d, i) => [d, i]));
  let numeral = new RegExp(`[${numerals.join('')}]`, 'g');
  let index = (d: string) => String(indexes.get(d));

  let {compact, compactParts} = getCompactSymbols(
    locale,
    intlOptions,
    symbolFormatter,
    numeral,
    index
  );

  // this set is also for a regex, it's all literals that might be in the string we want to eventually parse that
  // don't contribute to the numerical value
  let allPartsLiterals = allParts.filter(p => !nonLiteralParts.has(p.type)).map(p => p.value);
  let pluralPartsLiterals = [...pluralParts, ...compactParts].flatMap(p =>
    p.filter(p => !nonLiteralParts.has(p.type)).map(p => p.value)
  );
  let literalSymbols = new Set([...allPartsLiterals, ...pluralPartsLiterals]);
  for (let [symbol, compactSymbol] of compact) {
    compactSymbol.literal = literalSymbols.has(symbol);
  }
  let sortedLiterals = [...new Set([...literalSymbols, ...compact.keys()])].sort(
    (a, b) => b.length - a.length
  );

  // Match both whitespace and formatting characters
  let literals =
    sortedLiterals.length === 0
      ? new RegExp('\\p{White_Space}|\\p{Cf}', 'gu')
      : new RegExp(`${sortedLiterals.map(escapeRegex).join('|')}|\\p{White_Space}|\\p{Cf}`, 'gu');

  return {
    minusSign,
    plusSign,
    decimal,
    group,
    literals,
    numeral,
    numerals,
    index,
    noNumeralUnits,
    exponentSeparator,
    exponentMinusSign,
    compact
  };
}

/**
 * Finds the symbols used by compact notation and the power of ten that each represents.
 * Also returns the formatted parts, which can contain other literals such as units.
 */
function getCompactSymbols(
  locale: string,
  intlOptions: Intl.ResolvedNumberFormatOptions,
  symbolFormatter: Intl.NumberFormat,
  numeral: RegExp,
  index: (d: string) => string
): {compact: Map<string, CompactSymbol>; compactParts: Intl.NumberFormatPart[][]} {
  let compact = new Map<string, CompactSymbol>();
  let compactParts: Intl.NumberFormatPart[][] = [];
  if (intlOptions.notation !== 'compact') {
    return {compact, compactParts};
  }

  // Use full precision so that each formatted significand can be compared to the original value.
  let compactFormatter = new Intl.NumberFormat(locale, {
    ...symbolFormatter.resolvedOptions(),
    notation: 'compact',
    compactDisplay: intlOptions.compactDisplay
  });
  // Percentages are multiplied by 100 when formatted.
  let scale = intlOptions.style === 'percent' ? 100 : 1;

  // CLDR compact patterns cover powers of ten through 10^14.
  for (let power = 0; power <= 14; power++) {
    for (let plural of pluralNumbers) {
      if (plural === 0) {
        continue;
      }
      let value = plural * 10 ** power;
      let parts = compactFormatter.formatToParts(value);
      compactParts.push(parts);
      let compactIndex = parts.findIndex(p => p.type === 'compact');
      if (compactIndex === -1) {
        continue;
      }
      // The significand is the displayed number, e.g. 1.5 in "1.5K".
      let significand = Number(
        parts
          .filter(p => p.type === 'integer' || p.type === 'decimal' || p.type === 'fraction')
          .map(p => (p.type === 'decimal' ? '.' : p.value.replace(numeral, index)))
          .join('')
      );
      if (significand > 0) {
        compact.set(parts[compactIndex].value, {
          exponent: Math.round(Math.log10((value * scale) / significand)),
          prefix: compactIndex < parts.findIndex(p => p.type === 'integer'),
          // Set by getSymbols once all literals are known.
          literal: false
        });
      }
    }
  }

  return {compact, compactParts};
}

/** Multiplies a numeric string by a power of ten without introducing floating point errors. */
function scaleByPowerOfTen(value: string, exponent: number): string {
  if (exponent === 0) {
    return value;
  }
  return value.replace(
    /(?:e([+-]?\d+))?$/i,
    (_, existingExponent = '0') => `e${Number(existingExponent) + exponent}`
  );
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
