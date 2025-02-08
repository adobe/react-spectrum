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
import {useValueEffect} from './';

// copied from SSRProvider.tsx to reduce exports, if needed again, consider sharing
let canUseDOM = Boolean(
  typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);
// Directly caching RefObject can reduce memory usage
let idRefsMap: Map<string, { current: string | null }[]> = new Map();

/**
 * If a default is not provided, generate an id.
 * @param defaultId - Default component id.
 */
export function useId(defaultId?: string): string {
  let [value, setValue] = useState(defaultId);
  let nextId = useRef(null);

  let res = useSSRSafeId(value);

  if (canUseDOM) {
    const cacheIdRef = idRefsMap.get(res);
    if (cacheIdRef && !cacheIdRef.includes(nextId)) {
      cacheIdRef.push(nextId);
    } else {
     // It is also not safe in the concurrent mode here, but it is acceptable because the cached RefObject occupies a relatively small amount of memory
    // Saving the Fn earlier will cause a closure and lead to more memory leaks
      idRefsMap.set(res, [nextId]);
    }
  }

  useLayoutEffect(() => {
    let r = res;
    return () => {
      // In Suspense, the cleanup function may be not called
      idRefsMap.delete(r);
    };
  }, [res]);

  // This cannot cause an infinite loop because the ref is always cleaned up.
  // eslint-disable-next-line
  useEffect(() => {
    let newId = nextId.current;
    if (newId) { setValue(newId); }

    return () => {
      if (newId) { nextId.current = null; }
    };
  });

  return res;
}

/**
 * Merges two ids.
 * Different ids will trigger a side-effect and re-render components hooked up with `useId`.
 */
export function mergeIds(idA: string, idB: string): string {
  if (idA === idB) {
    return idA;
  }

  let idRefsA = idRefsMap.get(idA);
  if (idRefsA) {
    idRefsA.forEach((ref) => (ref.current = idB));
    return idB;
  }

  let idRefsB = idRefsMap.get(idB);
  if (idRefsB) {
    idRefsB.forEach((ref) => (ref.current = idA));
    return idA;
  }

  return idB;
}

/**
 * Used to generate an id, and after render, check if that id is rendered so we know
 * if we can use it in places such as labelledby.
 * @param depArray - When to recalculate if the id is in the DOM.
 */
export function useSlotId(depArray: ReadonlyArray<any> = []): string {
  let id = useId();
  let [resolvedId, setResolvedId] = useValueEffect(id);
  let updateId = useCallback(() => {
    setResolvedId(function *() {
      yield id;

      yield document.getElementById(id) ? id : undefined;
    });
  }, [id, setResolvedId]);

  useLayoutEffect(updateId, [id, updateId, ...depArray]);

  return resolvedId;
}
