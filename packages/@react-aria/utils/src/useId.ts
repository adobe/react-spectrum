import {useRef} from 'react';

let id = 0;
export function useId(defaultId?: string): string {
  let ref = useRef(defaultId || `react-spectrum-${++id}`);
  if (defaultId && ref.current !== defaultId) {
    ref.current = defaultId;
  }

  return ref.current;
}
