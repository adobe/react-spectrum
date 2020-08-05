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

import {useCallback, useEffect, useRef} from 'react';
import {useLocale} from './context';

type NumberParser = {
  parse: (value:string) => number
}

/**
 * Provides localized number parsing for the current locale.
 * Idea from https://observablehq.com/@mbostock/localized-number-parsing.
 */
export function useNumberParser(): NumberParser {
  let {locale} = useLocale();
  const numberData = useRef({group: null, decimal: null, numeral: null, index: null});

  useEffect(() => {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const numerals = [...new Intl.NumberFormat(locale, {useGrouping: false}).format(9876543210)].reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));
    
    numberData.current.group = new RegExp(`[${parts.find(d => d.type === 'group').value}]`, 'g');
    numberData.current.decimal = new RegExp(`[${parts.find(d => d.type === 'decimal').value}]`);
    numberData.current.numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    numberData.current.index = d => index.get(d);
  },  [locale]);

  const parse = useCallback((value:string) => {
    value = value.trim()
      .replace(numberData.current.group, '')
      .replace(numberData.current.decimal, '.')
      .replace(numberData.current.numeral, numberData.current.index);
    return value ? +value : NaN;
  }, []);

  return  {parse};
}
