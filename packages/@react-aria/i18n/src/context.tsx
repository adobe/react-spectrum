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
import React, {ReactNode, useContext} from 'react';
import {useDefaultLocale} from './useDefaultLocale';

interface ProviderProps {
  locale?: string,
  children: ReactNode
}

interface LocaleContext {
  locale: string,
  direction: 'ltr' | 'rtl'
}

const I18nContext = React.createContext<LocaleContext>({
  locale: 'en-US',
  direction: 'ltr'
});

export function Provider(props: ProviderProps) {
  let {locale, children} = props;
  let defaultLocale = useDefaultLocale();
  if (!locale) {
    locale = defaultLocale;
  }

  let value: LocaleContext = {
    locale,
    direction: isRTL(locale) ? 'rtl' : 'ltr'
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  return useContext(I18nContext);
}

// https://en.wikipedia.org/wiki/Right-to-left
const RTL_SCRIPTS = new Set(['Arab', 'Syrc', 'Samr', 'Mand', 'Thaa', 'Mend', 'Nkoo', 'Adlm', 'Rohg', 'Hebr']);
const RTL_LANGS = new Set(['ae', 'ar', 'arc', 'bcc', 'bqi', 'ckb', 'dv', 'fa', 'glk', 'he', 'ku', 'mzn', 'nqo', 'pnb', 'ps', 'sd', 'ug', 'ur', 'yi']);

function isRTL(locale) {
  // If the Intl.Locale API is available, use it to get the script for the locale.
  // This is more accurate than guessing by language, since languages can be written in multiple scripts.
  // @ts-ignore
  if (Intl.Locale) {
    // @ts-ignore
    let script = new Intl.Locale(locale).maximize().script;
    return RTL_SCRIPTS.has(script);
  }

  // If not, just guess by the language (first part of the locale)
  let lang = locale.split('-')[0];
  return RTL_LANGS.has(lang);
}
