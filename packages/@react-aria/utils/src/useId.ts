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

import {useCallback, useEffect, useRef, useState} from 'react';
import {useLayoutEffect} from './useLayoutEffect';
import {useSSRSafeId} from '@react-aria/ssr';

let map: Map<string, (v: string) => void> = new Map();

/**
 * If a default is not provided, generate an id.
 * @param defaultId - Default component id.
 */
export function useId(defaultId?: string): string {
  let [value, setValue] = useState(defaultId);
  // do i need to keep an entire queue? i think I only need the most recent?
  // does this actually work in the case that we're not mid render? it's a ref, so it won't
  // cause a re-render ever on it's own, that said, we might always be mid-render
  // we seem to only call mergeProps/Ids in the render flow, but now we'll need to document that
  // as a limitation of those functions
  let setIdUpdateQueue = useRef([]);
  let pushToQueue = useCallback((val) => {
    setIdUpdateQueue.current.push(val);
  }, [setIdUpdateQueue.current]);
  useEffect(() => {
    let newId = setIdUpdateQueue.current.pop();
    if (newId) {
      setValue(newId);
    }
    setIdUpdateQueue.current = [];
  }, [setValue, pushToQueue]);
  let res = useSSRSafeId(value);
  map.set(res, pushToQueue);
  return res;
}

// TODO this causes issues
/**
 * In updating to react 17, calling setState from another component gets more complex, however, we do this pretty easily/accidentally
 mergeProps calls on mergeIds which calls setState
 we frequently call mergeProps during the render cycle
 that setState isn’t necessarily the state of the component rendering, ergo, bad setState call
 anyone have any ideas how to resolve this?
 technically we’d need to make that setState call behind a useEffeect, but mergeId’s isn’t a hook… so no useEffect
 we could put it around mergeProps, but that seems complicated and impossible to enforce
 o, and i can’t make mergeId’s a hook either, that’d be breaking i think
 */
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
