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

let idsUpdaterMap: Map<string, (v: string) => void> = new Map();

/**
 * If a default is not provided, generate an id.
 * @param defaultId - Default component id.
 */
export function useId(defaultId?: string): string {
  let [value, setValue] = useState(defaultId);
  let nextId = useRef(null);

  let res = useSSRSafeId(value);

  let updateValue = useCallback((val) => {
    nextId.current = val;
  }, []);

  idsUpdaterMap.set(res, updateValue);

  useLayoutEffect(() => {
    let r = res;
    return () => {
      idsUpdaterMap.delete(r);
    };
  }, [res]);

  // This cannot cause an infinite loop because the ref is updated first.
  // eslint-disable-next-line
  useEffect(() => {
    let newId = nextId.current;
    if (newId) {
      nextId.current = null;
      setValue(newId);
    }
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

  let setIdA = idsUpdaterMap.get(idA);
  if (setIdA) {
    setIdA(idB);
    return idB;
  }

  let setIdB = idsUpdaterMap.get(idB);
  if (setIdB) {
    setIdB(idA);
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
