import IntlMessageFormat from 'intl-messageformat';
import {useLocale} from './context';

const formatterCache = new Map();

export function useMessageFormatter(strings) {
  let {locale: currentLocale} = useLocale();

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

  // Get the strings for the current locale
  let localeStrings = selectLocale(strings, currentLocale);

  // Create a new message formatter
  let cache = {};
  let formatMessage = (key, variables, formats) => {
    let message = cache[key + '.' + currentLocale];
    if (!message) {
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

function selectLocale(strings, locale) {
  // If there is an exact match, use it.
  if (strings[locale]) {
    return strings[locale];
  }

  // Attempt to find the closest match by language.
  // For example, if the locale is fr-CA (French Canadian), but there is only
  // an fr-FR (France) set of strings, use that.
  let language = getLanguage(locale);
  for (let key in strings) {
    if (key.startsWith(language + '-')) {
      return strings[key];
    }
  }

  // Nothing close, use english.
  return strings['en-US'];
}

function getLanguage(locale) {
  // @ts-ignore
  if (Intl.Locale) {
    // @ts-ignore
    return new Intl.Locale(locale).language;
  }

  return locale.split('-')[0];
}
