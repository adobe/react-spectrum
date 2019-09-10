import {EffectCallback, useEffect, useRef} from 'react';

// Like useEffect, but only called for updates after the initial render.
export function useUpdateEffect(effect: EffectCallback, dependencies: any[]) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
