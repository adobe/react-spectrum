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

import {DateFormatter} from '@internationalized/date';
import {useLocale} from './context';
import {useMemo, useRef} from 'react';
import {useLayoutEffect} from "@react-aria/utils";

export interface DateFormatterOptions extends Intl.DateTimeFormatOptions {
  calendar?: string
}

/**
 * Provides localized date formatting for the current locale. Automatically updates when the locale changes,
 * and handles caching of the date formatter for performance.
 * @param options - Formatting options.
 */
export function useDateFormatter(options?: DateFormatterOptions): DateFormatter {
  let {locale} = useLocale();

  // Reuse last options object if it is shallowly equal, which allows the useMemo result to also be reused.
  let lastOptions = useRef(null);
  let lastFormattedDate = useRef(null);
  let formattedDate = useMemo(() => {
    if (options && lastOptions.current && isEqual(options, lastOptions.current)) {
      return lastFormattedDate.current;
    }
    return new DateFormatter(locale, options);
  }, [locale, options]);
  useLayoutEffect(() => {
    lastOptions.current = options;
    lastFormattedDate.current = formattedDate;
  });

  return formattedDate;
}

function isEqual(a: DateFormatterOptions, b: DateFormatterOptions) {
  if (a === b) {
    return true;
  }

  let aKeys = Object.keys(a);
  let bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (let key of aKeys) {
    if (b[key] !== a[key]) {
      return false;
    }
  }

  return true;
}
