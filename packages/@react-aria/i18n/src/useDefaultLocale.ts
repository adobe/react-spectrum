import {useEffect, useState} from 'react';

export function getDefaultLocale() {
  // @ts-ignore
  return (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en-US';
}

// Returns the current browser/system language, and updates when it changes.
export function useDefaultLocale() {
  let [defaultLocale, setDefaultLocale] = useState(getDefaultLocale());

  useEffect(() => {
    let updateLocale = () => {
      setDefaultLocale(getDefaultLocale());
    };

    window.addEventListener('languagechange', updateLocale);
    return () => {
      window.removeEventListener('languagechange', updateLocale);
    };
  }, []);

  return defaultLocale;
}
