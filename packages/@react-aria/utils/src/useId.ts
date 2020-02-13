/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
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
