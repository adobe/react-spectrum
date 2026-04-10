/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, {SetStateAction, useCallback, useInsertionEffect, useRef, useState} from 'react';
import {useControlledState} from './useControlledState';

export const useControlledStateAction = typeof React['useTransition'] === 'function' && typeof React['useOptimistic'] === 'function'
  ? useControlledStateActionModern
  : useControlledStateActionLegacy;

function useControlledStateActionModern<T, C = T>(value: Exclude<T, undefined>, defaultValue: Exclude<T, undefined> | undefined, onChange?: (v: C) => void, changeAction?: (v: C) => void | Promise<void>): [T, boolean, (value: SetStateAction<T>) => void, error: unknown | null];
function useControlledStateActionModern<T, C = T>(value: Exclude<T, undefined> | undefined, defaultValue: Exclude<T, undefined>, onChange?: (v: C) => void, changeAction?: (v: C) => void | Promise<void>): [T, boolean, (value: SetStateAction<T>) => void, error: unknown | null];
function useControlledStateActionModern<T, C = T>(value: T, defaultValue: T, onChange?: (v: C) => void, changeAction?: (v: C) => void | Promise<void>): [T, boolean, (value: SetStateAction<T>) => void, error: unknown | null] {
  let [controlledValue, setControlledValue] = useControlledState(value as any, defaultValue, onChange);
  let [optimisticValue, setOptimisticValue] = React.useOptimistic(controlledValue);
  let [isPending, transition] = React.useTransition();
  let [error, setError] = useState<unknown | null>(null);
  let [optimisticError, setOptimisticError] = React.useOptimistic(error);

  // Store the optimistic value in a ref for use in setState callback.
  let valueRef = useRef(optimisticValue);
  useInsertionEffect(() => {
    valueRef.current = optimisticValue;
  });

  let setValue = useCallback(value => {
    // If there is no action, just update the value synchronously.
    if (!changeAction) {
      setControlledValue(value);
      return;
    }
    
    transition(async () => {
      // Determine the new value based on the current "optimistic" value, which is displayed to the user.
      let newValue = typeof value === 'function' ? value(valueRef.current) : value;
      if (!Object.is(newValue, valueRef.current)) {
        valueRef.current = newValue;

        // Set the optimistic value. This may be "ahead" of the controlled/uncontrolled value if the app suspends.
        setOptimisticValue(newValue);

        // Trigger onChange and update uncontrolled state.
        setControlledValue(newValue);

        // Trigger the async action.
        try {
          setOptimisticError(null);
          await changeAction(newValue);
          setError(null);
        } catch (err) {
          setError(err);
        }
      }
    });
  }, [setControlledValue, setOptimisticValue, setOptimisticError, changeAction]);

  return [optimisticValue, isPending, setValue, optimisticError];
}

function useControlledStateActionLegacy<T, C = T>(value: Exclude<T, undefined>, defaultValue: Exclude<T, undefined> | undefined, onChange?: (v: C) => void, changeAction?: (v: C) => void | Promise<void>): [T, boolean, (value: SetStateAction<T>) => void, unknown | null];
function useControlledStateActionLegacy<T, C = T>(value: Exclude<T, undefined> | undefined, defaultValue: Exclude<T, undefined>, onChange?: (v: C) => void, changeAction?: (v: C) => void | Promise<void>): [T, boolean, (value: SetStateAction<T>) => void, unknown | null];
function useControlledStateActionLegacy<T, C = T>(value: T, defaultValue: T, onChange?: (v: C) => void, changeAction?: (v: C) => void | Promise<void>): [T, boolean, (value: SetStateAction<T>) => void, unknown | null] {
  if (changeAction) {
    throw new Error('Actions are only supported in React 19 and later.');
  }

  let [controlledValue, setControlledValue] = useControlledState(value as any, defaultValue, onChange);
  return [controlledValue, false, setControlledValue, null];
}
