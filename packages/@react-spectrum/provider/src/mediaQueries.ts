import {Theme, Scale, ColorScheme} from './types';
import {useState, useEffect} from 'react';

export function useColorScheme(theme: Theme, defaultColorScheme: ColorScheme): ColorScheme {  
  let matchesDark = useMediaQuery('(prefers-color-scheme: dark)');
  let matchesLight = useMediaQuery('(prefers-color-scheme: light)');

  if (theme.dark && (matchesDark || defaultColorScheme === 'dark' || !theme.light)) {
    return 'dark';
  }

  if (theme.light && (matchesLight || defaultColorScheme === 'light' || !theme.dark)) {
    return 'light';
  }
}

export function useScale(theme: Theme): Scale {
  let matchesFine = useMediaQuery('(any-pointer: fine)');
  if (matchesFine && theme.medium) {
    return 'medium';
  }

  if (theme.large) {
    return 'large';
  }

  return 'medium';
}

const supportsMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
function useMediaQuery(query: string) {
  let [matches, setMatches] = useState(() => 
    supportsMatchMedia
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    if (!supportsMatchMedia) {
      return;
    }

    let mq = window.matchMedia(query);
    let onChange = () => {
      setMatches(mq.matches);
    };

    mq.addListener(onChange);
    return () => {
      mq.removeListener(onChange);
    };
  }, [query]);

  return matches;
}
