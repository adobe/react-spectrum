import React, {ReactNode, useContext} from 'react';

interface ProviderProps {
  locale?: string,
  children: ReactNode
}

interface LocaleContext {
  locale: string,
  direction: 'ltr' | 'rtl'
}

// @ts-ignore
const defaultLocale: string = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en-US';
const I18nContext = React.createContext<LocaleContext>({
  locale: defaultLocale,
  direction: 'ltr'
});

export function Provider({locale = defaultLocale, children}: ProviderProps) {
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
