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

import {useCallback, useRef} from 'react';

type Fn<T extends any[]> = (...args: T) => void
type Subscribe<T extends any[]> = (fn: Fn<T>) => () => void;;

export function useStateEvent<T extends any[]>(): [Subscribe<T>, Fn<T>] {
  let subscriptions = useRef(new Set<Fn<T>>());

  let subscribe = useCallback((fn: Fn<T>) => {
    subscriptions.current.add(fn);
    return () => subscriptions.current.delete(fn);
  }, []);

  let emit = useCallback((...args: T) => {    
    for (let fn of subscriptions.current) {
      fn(...args);
    }
  }, []);

  return [subscribe, emit];
}
