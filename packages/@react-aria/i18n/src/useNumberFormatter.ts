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

import {useLocale} from './context';

let formatterCache = new Map<string, Intl.NumberFormat>();
export function useNumberFormatter(options?: Intl.NumberFormatOptions) {
  let {locale} = useLocale();
  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : '');
  if (formatterCache.has(cacheKey)) {
    return formatterCache.get(cacheKey);
  }

  let numberFormatter = new Intl.NumberFormat(locale, options);
  formatterCache.set(cacheKey, numberFormatter);
  return numberFormatter;
}
