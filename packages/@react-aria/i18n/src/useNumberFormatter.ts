import {useLocale} from './context';
import {useMemo} from 'react';

export function useNumberFormatter(options?: Intl.NumberFormatOptions) {
  let {locale} = useLocale();
  let numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale, options),
    [locale, options]
  );
  return numberFormatter;
}
