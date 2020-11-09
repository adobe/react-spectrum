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

import {useCallback, useEffect, useMemo, useRef} from 'react';
import {useLocale} from './context';

type NumberParser = {
  parse: (value:string) => number,
  symbols: {
    minusSign: string,
    plusSign: string,
    decimal: string,
    validCharacters: string,
    literals: string,
    group: string
  }
}

/**
 * Provides localized number parsing for the current locale.
 * Idea from https://observablehq.com/@mbostock/localized-number-parsing.
 */
export function useNumberParser(formatter, numeralOverride): NumberParser {
  let {locale} = useLocale();
  if (numeralOverride && locale.indexOf('-u-nu-') === -1) {
    locale = `${locale}-${numeralOverride}`;
  }
  const numberData = useRef({group: null, decimal: null, numeral: null, index: null});

  let intlOptions = useMemo(() => formatter.resolvedOptions(), [formatter]);
  let symbols = useMemo(() => {
    // Get the minus sign of the current locale to filter the input value
    // Automatically updates the minus sign when numberFormatter changes
    // won't work for currency accounting, but we have validCharacters for that in the pattern
    // Note: some locale's don't add a group symbol until there is a ten thousands place
    let allParts = formatter.formatToParts(-10000.1);
    let minusSign = allParts.find(p => p.type === 'minusSign')?.value;
    let posAllParts = formatter.formatToParts(10000.1);
    let plusSign = posAllParts.find(p => p.type === 'plusSign')?.value;
    console.log(allParts, formatter.resolvedOptions());

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
    return {minusSign, plusSign, decimal, validCharacters, literals, group};
  }, [formatter, intlOptions]);

  useEffect(() => {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const numerals = [...new Intl.NumberFormat(locale, {useGrouping: false}).format(9876543210)].reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));

    numberData.current.group = new RegExp(`[${parts.find(d => d.type === 'group').value}]`, 'g');
    numberData.current.decimal = new RegExp(`[${parts.find(d => d.type === 'decimal').value}]`);
    numberData.current.numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    numberData.current.index = d => index.get(d);
  },  [locale]);

  const parse = useCallback((value:string): number => {
    // first match the prefix/suffix wrapper of everything that isn't a number
    // then preserve that as we'll need to put it back together as the current input value
    // with the actual numerals, parse them into a number
    value = value.trim()
      .replace(numberData.current.group, '')
      .replace(numberData.current.decimal, '.')
      .replace(numberData.current.numeral, numberData.current.index);

    let newValue = value ? +value : NaN;
    return newValue;
  }, [locale]);

  return  {parse, symbols};
}
