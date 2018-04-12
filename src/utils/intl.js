import IntlMessageFormat from 'intl-messageformat';

export const defaultLocale = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en-US';

let currentLocale = defaultLocale;
export function setLocale(locale) {
  currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}

export function messageFormatter(strings) {
  let cache = {};

  return function formatMessage(key, variables, formats) {
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
}
