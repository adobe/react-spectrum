import {useMemo, useState} from 'react';

let map: Map<string, (v: string) => void> = new Map();

let id = 0;
export function useId(defaultId?: string): string {
  let [value, setValue] = useState(defaultId);
  let res = useMemo(() => value || `react-spectrum-${++id}`, [value]);
  map.set(res, setValue);
  return res;
}

export function mergeIds(a: string, b: string): string {
  if (a === b) {
    return a;
  }

  let setA = map.get(a);
  if (setA) {
    setA(b);
    return b;
  }

  let setB = map.get(b);
  if (setB) {
    setB(a);
    return a;
  }

  return b;
}
