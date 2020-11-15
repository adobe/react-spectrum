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

import {useCallback, useMemo} from 'react';
import {useLocale} from './context';
import {useNumberFormatter} from './useNumberFormatter';

type NumberParser = {
  parse: (value: string) => number,
  round: (value: number) => number,
  symbols: {
    minusSign: string,
    plusSign: string,
    decimal: string,
    currency: string,
    validCharacters: string,
    literals: string,
    group: string
  }
}

type NumberingSystems = 'latn' | 'hanidec' | 'arab'

// known supported numbering systems
let numberingSystems = {
  arab: [...('٠١٢٣٤٥٦٧٨٩')],
  hanidec: [...('〇一二三四五六七八九')],
  latn: [...('0123456789')]
};


export let determineNumeralSystem = (value: string): NumberingSystems => {
  for (let i in [...value]) {
    let char = value[i];
    let system = Object.keys(numberingSystems).find(key => numberingSystems[key].some(numeral => numeral === char));
    if (system) {
      return system as 'latn' | 'hanidec' | 'arab';
    }
  }
  return undefined;
};

let CURRENCY_SIGN_REGEX = new RegExp('^\\(.*\\)$');

let replaceAllButFirstOccurrence = (val: string, char: string) => {
  let first = val.indexOf(char);
  let prefix = val.substring(0, first + 1);
  let suffix = val.substring(first + 1).replace(char, '');
  return prefix + suffix;
};

/**
 * Provides localized number parsing for the current locale.
 * Idea from https://observablehq.com/@mbostock/localized-number-parsing.
 */
export function useNumberParser(options?: Intl.NumberFormatOptions, numeralSystem?: NumberingSystems): NumberParser {
  let {locale} = useLocale();
  if (numeralSystem && locale.indexOf('-u-nu-') === -1) {
    switch (numeralSystem) {
      case 'arab':
        locale = `${locale}-u-nu-arab`;
        break;
      case 'hanidec':
        locale = `${locale}-u-nu-hanidec`;
        break;
      case 'latn':
        locale = `${locale}-u-nu-latn`;
        break;
      default:
        break;
    }
  }

  let formatter = useNumberFormatter(options, numeralSystem);
  let intlOptions = useMemo(() => formatter.resolvedOptions(), [formatter]);

  let symbols = useMemo(() => {
    // Get the minus sign of the current locale to filter the input value
    // Automatically updates the minus sign when numberFormatter changes
    // won't work for currency accounting, but we have validCharacters for that in the pattern
    // Note: some locale's don't add a group symbol until there is a ten thousands place
    let allParts = formatter.formatToParts(-10000.1);
    let minusSign = allParts.find(p => p.type === 'minusSign')?.value;
    let currency = allParts.find(p => p.type === 'currency')?.value;
    let posAllParts = formatter.formatToParts(10000.1);
    let plusSign = posAllParts.find(p => p.type === 'plusSign')?.value;

    let decimal = allParts.find(p => p.type === 'decimal')?.value;
    let group = allParts.find(p => p.type === 'group')?.value;
    // this is a string ready for a regex so we can identify allowed to type characters, signs are excluded because
    // the user needs to decide if it's allowed based on min/max values which parsing doesn't care about
    let validCharacters = allParts.filter(p => {
      if (p.type === 'decimal' && intlOptions.maximumFractionDigits === 0) {
        return false;
      }
      if (p.type === 'fraction' || p.type === 'integer' || p.type === 'minusSign' || p.type === 'plusSign') {
        return false;
      }
      return true;
    }).map(p => p.value).join('');
    // this set is also for a regex, it's all literals that might be in the string we want to eventually parse that
    // don't contribute to the numerical value
    let literals = allParts.filter(p => {
      if (p.type === 'decimal' || p.type === 'fraction' || p.type === 'integer' || p.type === 'minusSign' || p.type === 'plusSign') {
        return false;
      }
      return true;
    }).map(p => p.value).join('');

    // These are for replacing non-latn characters with the latn equivalent
    let numerals = [...new Intl.NumberFormat(locale, {useGrouping: false}).format(9876543210)].reverse();
    let indexes = new Map(numerals.map((d, i) => [d, i]));
    let numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    let index = d => String(indexes.get(d));

    return {minusSign, plusSign, decimal, group, currency, validCharacters, literals, numeral, index};
  }, [formatter, intlOptions, locale]);

  const parse = useCallback((value:string): number => {
    // to parse the number, we need to remove anything that isn't actually part of the number, for example we want '-10.40' not '-10.40 USD'
    let fullySanitizedValue = value.replace(new RegExp(`[${symbols.literals}]`, 'g'), '');
    // first match the prefix/suffix wrapper of everything that isn't a number
    // then preserve that as we'll need to put it back together as the current input value
    // with the actual numerals, parse them into a number
    fullySanitizedValue = fullySanitizedValue.trim()
      .replace(symbols.group, '')
      .replace(symbols.decimal, '.')
      .replace(symbols.numeral, symbols.index);

    let newValue = fullySanitizedValue ? +fullySanitizedValue : NaN;
    if (isNaN(newValue)) {
      return NaN;
    }

    // accounting will always be stripped to a positive number, so if it's accounting and has a () around everything, then we need to make it negative again
    if (intlOptions?.currencySign === 'accounting' && CURRENCY_SIGN_REGEX.test(value)) {
      newValue = -1 * newValue;
    }
    // when reading the number, if it's a percent, then it should be interpreted as being divided by 100
    if (intlOptions?.style === 'percent') {
      newValue = newValue / 100;
      // after dividing to get the percent value, javascript may get .0210999999 instead of .0211, so fix the number of fraction digits
      newValue = +newValue.toFixed(intlOptions.maximumFractionDigits + 2);
    }

    return newValue;
  }, [symbols, intlOptions]);


  // given that numbers can have
  // max/min sigfigs and decimals, and some of the
  // formats have defaults, like currency,
  // take the approach of formatting our value
  // then joining together the relevant parts
  // then parsing that joined result back to a number
  // this should round us as the formatter does
  let round = (value: number): number => {
    let parts = formatter.formatToParts(value);
    let strippedValue = parts.map((part) => {
      // list from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/formatToParts
      // this is meant to turn the formatted number into something that the parser can handle
      // unfortunately not every locale acts the same, in tr-TR-u-nu-arab, a comma is the decimal and the number parser can't handle that
      // so we always return a '.' in the decimal case. If done for all, then latin doesn't parse correctly :(
      switch (part.type) {
        case 'decimal':
        case 'minusSign':
        case 'plusSign':
        case 'fraction':
        case 'integer':
          return part.value;
        case 'currency':
        case 'nan':
        case 'percentSign':
        case 'group':
        case 'infinity':
        case 'literal':
        case 'unit': // this is supported in chrome :-/ for {style: 'unit', unit: 'percent', signDisplay: 'always'}
        default:
          return '';
      }
    }).join('');
    let result = parse(strippedValue);
    if (intlOptions?.currencySign === 'accounting' && value < 0) {
      result = -1 * result;
    }
    return result;
  };

  return  {parse, round, symbols};
}

// this removes any not allowed characters from the string
export let cleanString = (value: string, symbols, locale, numeralSystem): string => {
  let {minusSign = '', plusSign = '', validCharacters, group, decimal, currency} = symbols;

  // Note to anyone who finds a bug with it, Bulgarian US Dollar currency formatting has decimals in the currency symbol,
  // we need to be careful not to remove those. If there is a currency symbol in the string, make a note
  // that way after we replace a bunch of characters 1:1, we can put back the correct currency symbol.
  // Do not try to replace it after deleting various characters in the string.
  let indexOfCurrency;
  if (currency) {
    indexOfCurrency = value.indexOf(currency);
  }

  // In arab numeral system, their decimal character is 1643, but most keyboards don't type that
  // instead they use the , (44) character or apparently the (1548) character.
  let result = value;
  if (numeralSystem === 'arab') {
    result = result.replace(',', decimal);
    result = result.replace(String.fromCharCode(1548), decimal);
    result = result.replace('.', group);
  }

  // fr-FR group character is char code 8239, but that's not a key on the french keyboard,
  // so allow 'period' as a group char and replace it with a space
  if (locale === 'fr-FR') {
    result = result.replace('.', String.fromCharCode(8239));
  }

  // This is a safe place to make this check, every character has been replaced with exactly one new one.
  // If we do it any later than this, some characters are deleted and we'd need to do more math to figure out where
  // the currency symbol has ended up.
  if (currency && indexOfCurrency !== -1) {
    result = result.substring(0, indexOfCurrency) + currency + result.substring(indexOfCurrency + currency.length, result.length);
  }

  let numerals = numberingSystems[numeralSystem || 'latn'].join('');
  if (!numeralSystem) {
    numerals = `${numerals}${numberingSystems['hanidec'].join('')}${numberingSystems['arab'].join('')}`;
  }
  let invalidChars = new RegExp(`[^${minusSign}${plusSign}${numerals}${validCharacters}]`, 'g');
  let strippedValue = result.replace(invalidChars, '');
  strippedValue = replaceAllButFirstOccurrence(strippedValue, minusSign);
  strippedValue = replaceAllButFirstOccurrence(strippedValue, plusSign);
  strippedValue = replaceAllButFirstOccurrence(strippedValue, decimal);

  return strippedValue;
};
