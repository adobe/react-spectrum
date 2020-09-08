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

import {useLayoutEffect} from './useLayoutEffect';
import {useSSRSafeId} from '@react-aria/ssr';
import {useState} from 'react';

let map: Map<string, (v: string) => void> = new Map();

/**
 * If a default is not provided, generate an id.
 * @param defaultId - Default component id.
 */
export function useId(defaultId?: string): string {
  let [value, setValue] = useState(defaultId);
  let res = useSSRSafeId(value);
  map.set(res, setValue);
  return res;
}

/**
 * Merges two ids.
 */
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

/**
 * Used to generate an id, and after render, check if that id is rendered so we know
 * if we can use it in places such as labelledby.
 */
export function useSlotId(): string {
  let [id, setId] = useState(useId());
  useLayoutEffect(() => {
    let setCurr = map.get(id);
    if (setCurr && !document.getElementById(id)) {
      setId(null);
    }
  }, [id]);

  return id;
}
