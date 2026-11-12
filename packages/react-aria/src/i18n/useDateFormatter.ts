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
import {isEqual, useDeepMemo} from '../utils/useDeepMemo';
import {useLocale} from './I18nProvider';
import {useMemo} from 'react';

export interface DateFormatterOptions extends Intl.DateTimeFormatOptions {
  calendar?: string;
}

/**
 * Provides localized date formatting for the current locale. Automatically updates when the locale
 * changes, and handles caching of the date formatter for performance.
 *
 * @param options - Formatting options.
 */
export function useDateFormatter(options?: DateFormatterOptions): DateFormatter {
  // Reuse last options object if it is shallowly equal, which allows the useMemo result to also be reused.
  options = useDeepMemo(options ?? {}, isEqual);
  let {locale} = useLocale();
  return useMemo(() => new DateFormatter(locale, options), [locale, options]);
}
