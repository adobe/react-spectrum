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
import {useMemo} from 'react';

/**
 * Provides localized list formatting for the current locale. Automatically updates when the locale changes,
 * and handles caching of the list formatter for performance.
 * @param options - Formatting options.
 */

// Typescript version 4.7 supports Intl.ListFormat - TODO upgrade
// @ts-ignore
export function useListFormatter(options: Intl.ListFormatOptions = {}): Intl.ListFormat {
  let {locale} = useLocale();
  // @ts-ignore
  return useMemo(() => new Intl.ListFormat(locale, options), [locale, options]);
}
