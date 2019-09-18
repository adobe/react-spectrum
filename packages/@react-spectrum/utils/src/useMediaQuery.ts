import {useEffect, useState} from 'react';

export function useMediaQuery(query: string) {
  let supportsMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
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
  }, [supportsMatchMedia, query]);

  return matches;
}
