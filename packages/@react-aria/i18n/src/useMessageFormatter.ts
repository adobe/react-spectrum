import {useLocale} from './context';
import IntlMessageFormat from 'intl-messageformat';

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
