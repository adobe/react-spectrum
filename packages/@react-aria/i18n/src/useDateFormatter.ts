import {useLocale} from './context';

let formatterCache = new Map<string, Intl.DateTimeFormat>();
export function useDateFormatter(options?: Intl.DateTimeFormatOptions) {
  let {locale} = useLocale();

  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : '');
  if (formatterCache.has(cacheKey)) {
    return formatterCache.get(cacheKey);
  }

  let formatter = new Intl.DateTimeFormat(locale, options);
  formatterCache.set(cacheKey, formatter);
  return formatter;
}
