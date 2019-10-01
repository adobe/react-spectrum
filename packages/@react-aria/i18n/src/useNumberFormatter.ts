import {useLocale} from './context';

let numberFormatterCache = new Map<string, Intl.NumberFormat>();
export function useNumberFormatter(options?: Intl.NumberFormatOptions) {
  let {locale} = useLocale();

  let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : '');
  if (numberFormatterCache.has(cacheKey)) {
    return numberFormatterCache.get(cacheKey);
  }

  let formatter = new Intl.NumberFormat(locale, options);
  numberFormatterCache.set(cacheKey, formatter);
  return formatter;
}
