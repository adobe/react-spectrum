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

import {LocalizedStrings, MessageDictionary, MessageFormatter} from '@internationalized/message';
import {useCallback, useMemo} from 'react';
import {useLocale} from './context';

type FormatMessage = (key: string, variables?: {[key: string]: any}) => string;

const cache = new WeakMap();
function getCachedDictionary(strings: LocalizedStrings) {
  let dictionary = cache.get(strings);
  if (!dictionary) {
    dictionary = new MessageDictionary(strings);
    cache.set(strings, dictionary);
  }

  return dictionary;
}

/**
 * Handles formatting ICU Message strings to create localized strings for the current locale.
 * Automatically updates when the locale changes, and handles caching of messages for performance.
 * @param strings - A mapping of languages to strings by key.
 */
export function useMessageFormatter(strings: LocalizedStrings): FormatMessage {
  let {locale} = useLocale();
  let dictionary = useMemo(() => getCachedDictionary(strings), [strings]);
  let formatter = useMemo(() => new MessageFormatter(locale, dictionary), [locale, dictionary]);
  return useCallback((key, variables) => formatter.format(key, variables), [formatter]);
}
