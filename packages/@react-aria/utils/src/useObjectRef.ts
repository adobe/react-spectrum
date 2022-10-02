/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {MutableRefObject, useRef} from 'react';
import {useLayoutEffect} from './';

/**
 * Offers an object ref for a given callback ref or an object ref. Especially
 * helfpul when passing forwarded refs (created using `React.forwardRef`) to
 * React Aria Hooks.
 *
 * @param forwardedRef The original ref intended to be used.
 * @returns An object ref that updates the given ref.
 * @see https://reactjs.org/docs/forwarding-refs.html
 */
export function useObjectRef<T>(forwardedRef?: ((instance: T | null) => void) | MutableRefObject<T | null> | null): MutableRefObject<T> {
  const objRef = useRef<T>();

  /**
   * We're using `useLayoutEffect` here instead of `useEffect` because we want
   * to make sure that the `ref` value is up to date before other places in the
   * the execution cycle try to read it.
   */
  useLayoutEffect(() => {
    if (!forwardedRef) {
      return;
    }

    if (typeof forwardedRef === 'function') {
      forwardedRef(objRef.current);
    } else {
      forwardedRef.current = objRef.current;
    }

    return () => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(null);
      } else {
        forwardedRef.current = null;
      }
    };
  }, [forwardedRef]);

  return objRef;
}
