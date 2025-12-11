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

import React, {SetStateAction, useCallback, useEffect, useReducer, useRef, useState} from 'react';

// Use the earliest effect possible to reset the ref below.
const useEarlyEffect: typeof React.useLayoutEffect = typeof document !== 'undefined'
  ? React['useInsertionEffect'] ?? React.useLayoutEffect
  : () => {};

export function useControlledState<T, C = T>(value: Exclude<T, undefined>, defaultValue: Exclude<T, undefined> | undefined, onChange?: (v: C, ...args: any[]) => void): [T, (value: SetStateAction<T>, ...args: any[]) => void];
export function useControlledState<T, C = T>(value: Exclude<T, undefined> | undefined, defaultValue: Exclude<T, undefined>, onChange?: (v: C, ...args: any[]) => void): [T, (value: SetStateAction<T>, ...args: any[]) => void];
export function useControlledState<T, C = T>(value: T, defaultValue: T, onChange?: (v: C, ...args: any[]) => void): [T, (value: SetStateAction<T>, ...args: any[]) => void] {
  let isControlled = value !== undefined;
  let isControlledRef = useRef(isControlled);
  useEffect(() => {
    let wasControlled = isControlledRef.current;
    if (wasControlled !== isControlled && process.env.NODE_ENV !== 'production') {
      console.warn(`WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${isControlled ? 'controlled' : 'uncontrolled'}.`);
    }
    isControlledRef.current = isControlled;
  }, [isControlled]);

  // The state value will only be used when uncontrolled.
  let [stateValue, setStateValue] = useState(defaultValue);

  let currentValue = isControlled ? value : stateValue;

  // The ref is used to track the most current value, which is passed to the function setState callback.
  let currentValueRef = useRef(currentValue);
  // After each render, update the ref to the current value.
  // This ensures that the setState callback argument is reset.
  // Note: the effect should not have any dependencies so that controlled values always reset.
  useEarlyEffect(() => {
    currentValueRef.current = currentValue;
  });

  const [, forceUpdate] = useReducer(() => ({}), {});

  let setValue = useCallback((value: SetStateAction<T>, ...args: any[]) => {
    // @ts-ignore - TS doesn't know that T cannot be a function.
    let newValue = typeof value === 'function' ? value(currentValueRef.current) : value;
    if (!Object.is(currentValueRef.current, newValue)) {
      // Update the ref so that the next setState callback has the most recent value.
      currentValueRef.current = newValue;

      if (!isControlled) {
        setStateValue(newValue);
      }

      // Trigger onChange. Note that if setState is called multiple times in a single event,
      // onChange will be called for each one instead of only once.
      onChange?.(newValue, ...args);

      // Always trigger a rerender, so that the early effect above runs to reset the value.
      forceUpdate();
    }
  }, [isControlled, onChange]);

  return [currentValue, setValue];
}
