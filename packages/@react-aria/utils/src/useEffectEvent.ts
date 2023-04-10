
import {useCallback, useRef} from 'react';
import {useLayoutEffect} from './useLayoutEffect';

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
