/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {LocalizedString} from './LocalizedStringFormatter';

export type LocalizedStrings<K extends string, T extends LocalizedString> = {
  [lang: string]: Record<K, T>
};

/**
 * Stores a mapping of localized strings. Can be used to find the
 * closest available string for a given locale.
 */
export class LocalizedStringDictionary<K extends string = string, T extends LocalizedString = string> {
  private strings: LocalizedStrings<K, T>;
  private defaultLocale: string;

  constructor(messages: LocalizedStrings<K, T>, defaultLocale: string = 'en-US') {
    // Clone messages so we don't modify the original object.
    this.strings = {...messages};
    this.defaultLocale = defaultLocale;
  }

  /** Returns a localized string for the given key and locale. */
  getStringForLocale(key: K, locale: string): T {
    let strings = this.strings[locale];
    if (!strings) {
      strings = getStringsForLocale(locale, this.strings, this.defaultLocale);
      this.strings[locale] = strings;
    }

    let string = strings[key];
    if (!string) {
      throw new Error(`Could not find intl message ${key} in ${locale} locale`);
    }

    return string;
  }
}

function getStringsForLocale<K extends string, T extends LocalizedString>(locale: string, strings: LocalizedStrings<K, T>, defaultLocale = 'en-US') {
  // If there is an exact match, use it.
  if (strings[locale]) {
    return strings[locale];
  }

  // Attempt to find the closest match by language.
  // For example, if the locale is fr-CA (French Canadian), but there is only
  // an fr-FR (France) set of strings, use that.
  // This could be replaced with Intl.LocaleMatcher once it is supported.
  // https://github.com/tc39/proposal-intl-localematcher
  let language = getLanguage(locale);
  if (strings[language]) {
    return strings[language];
  }

  for (let key in strings) {
    if (key.startsWith(language + '-')) {
      return strings[key];
    }
  }

  // Nothing close, use english.
  return strings[defaultLocale];
}

function getLanguage(locale: string) {
  // @ts-ignore
  if (Intl.Locale) {
    // @ts-ignore
    return new Intl.Locale(locale).language;
  }

  return locale.split('-')[0];
}
