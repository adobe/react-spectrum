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

import {Dispatch, RefObject, useCallback, useRef, useState} from 'react';
import {useLayoutEffect} from './';

type SetValueAction<S> = (prev: S) => Generator<any, void, unknown>;

// This hook works like `useState`, but when setting the value, you pass a generator function
// that can yield multiple values. Each yielded value updates the state and waits for the next
// layout effect, then continues the generator. This allows sequential updates to state to be
// written linearly.
export function useValueEffect<S>(defaultValue: S | (() => S)): [S, Dispatch<SetValueAction<S>>] {
  let [value, setValue] = useState(defaultValue);
  // Keep an up to date copy of value in a ref so we can access the current value in the generator.
  // This allows us to maintain a stable queue function.
  let currValue = useRef(value);
  let effect: RefObject<Generator<S> | null> = useRef<Generator<S> | null>(null);

  // Store the function in a ref so we can always access the current version
  // which has the proper `value` in scope.
  let nextRef = useRef(() => {
    if (!effect.current) {
      return;
    }
    // Run the generator to the next yield.
    let newValue = effect.current.next();

    // If the generator is done, reset the effect.
    if (newValue.done) {
      effect.current = null;
      return;
    }

    // If the value is the same as the current value,
    // then continue to the next yield. Otherwise,
    // set the value in state and wait for the next layout effect.
    if (currValue.current === newValue.value) {
      nextRef.current();
    } else {
      setValue(newValue.value);
    }
  });

  useLayoutEffect(() => {
    currValue.current = value;
    // If there is an effect currently running, continue to the next yield.
    if (effect.current) {
      nextRef.current();
    }
  });

  let queue = useCallback(fn => {
    effect.current = fn(currValue.current);
    nextRef.current();
  }, [nextRef]);

  return [value, queue];
}
