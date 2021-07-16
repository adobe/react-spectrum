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

import {useEffect, useRef, useState} from 'react';
import {useLayoutEffect} from './useLayoutEffect';
import {useSSRSafeId} from '@react-aria/ssr';

let idsUpdaterMap: Map<string, (v: string) => void> = new Map();

/**
 * If a default is not provided, generate an id.
 * @param defaultId - Default component id.
 */
export function useId(defaultId?: string): string {
  let isRendering = useRef(true);
  isRendering.current = true;
  let [value, setValue] = useState(defaultId);
  let nextId = useRef(null);

  let res = useSSRSafeId(value);

  // don't memo this, we want it new each render so that the Effects always run
  let updateValue = (val) => {
    if (!isRendering.current) {
      setValue(val);
    } else {
      nextId.current = val;
    }
  };

  idsUpdaterMap.set(res, updateValue);

  useLayoutEffect(() => {
    isRendering.current = false;
  }, [updateValue]);

  useLayoutEffect(() => {
    let r = res;
    return () => {
      idsUpdaterMap.delete(r);
    };
  }, [res]);

  useEffect(() => {
    let newId = nextId.current;
    if (newId) {
      setValue(newId);
      nextId.current = null;
    }
  }, [setValue, updateValue]);
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
 */
export function useSlotId(): string {
  let id = useId();
  let [resolvedId, setResolvedId] = useState(id);
  useLayoutEffect(() => {
    let setCurr = idsUpdaterMap.get(id);
    if (setCurr && !document.getElementById(id)) {
      setResolvedId(null);
    } else {
      setResolvedId(id);
    }
  }, [id]);

  return resolvedId;
}
