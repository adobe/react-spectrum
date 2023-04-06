// eslint-disable-next-line rulesdir/useLayoutEffectRule
import {useCallback, useLayoutEffect, useRef} from 'react';

// The useEvent API has not yet been added to React,
// so this is a temporary shim to make this sandbox work.
// You're not expected to write code like this yourself.

export function useEffectEvent(fn) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args) => {
    const f = ref.current;
    return f(...args);
  }, []);
}
