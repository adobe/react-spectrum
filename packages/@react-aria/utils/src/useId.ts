import {useMemo, useState} from 'react';

let map: Map<string, (v: string) => void> = new Map();

let id = 0;
// don't want to conflict with ids from v2, this will guarantee something unique
// plus we'll know how many instances of this module are loaded on a page if there are more than one number ;)
let randomInstanceNumber = Math.round(Math.random() * 10000000000);
export function useId(defaultId?: string): string {
  let [value, setValue] = useState(defaultId);
  let res = useMemo(() => value || `react-spectrum-${randomInstanceNumber}-${++id}`, [value]);
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
