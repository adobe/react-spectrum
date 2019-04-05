
import IntlMessageFormat from 'intl-messageformat';
import React, {useContext, useMemo} from 'react';

const defaultLocale = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en-US';
const I18nContext = React.createContext(defaultLocale);

export function Provider({locale = defaultLocale, children}) {
  return (
    <I18nContext.Provider value={locale}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLocale() {
  return useContext(I18nContext);
}

const formatterCache = new Map();

export function useMessageFormatter(strings) {
  let currentLocale = useLocale();

  // Check the cache
  let localeCache = formatterCache.get(strings);
  if (localeCache && localeCache.has(currentLocale)) {
    return localeCache.get(currentLocale);
  }

  // Add to the formatter cache if needed
  if (!localeCache) {
    localeCache = new Map();
    formatterCache.set(strings, localeCache);
  }

  // Create a new message formatter
  let cache = {};
  let formatMessage = (key, variables, formats) => {
    let message = cache[key + '.' + currentLocale];
    if (!message) {
      let localeStrings = strings[currentLocale] || strings['en-US'];
      let msg = localeStrings[key];
      if (!msg) {
        throw new Error(`Could not find intl message ${key} in ${currentLocale} locale`);
      }

      message = new IntlMessageFormat(msg, currentLocale, formats);
      cache[key] = message;
    }

    return message.format(variables);
  };

  localeCache.set(currentLocale, formatMessage);
  return formatMessage;
}
