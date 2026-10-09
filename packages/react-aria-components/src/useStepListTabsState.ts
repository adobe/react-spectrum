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
import {Key} from '@react-types/shared';
import {useControlledState} from 'react-stately/useControlledState';
import {useEffect, useMemo} from 'react';

export interface StepListTabsStateOptions {
  /** Ordered list of step keys, in collection order. */
  keys: Key[];
  /** The currently selected step (controlled). */
  selectedKey?: Key | null;
  /** The initially selected step (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Handler called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: Key;
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Handler called when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether the step list is read only. */
  isReadOnly?: boolean;
}

export interface StepListTabsState {
  /** The current (selected) step. */
  selectedKey: Key | null;
  /** Sets the current (selected) step. */
  setSelectedKey(key: Key): void;
  /**
   * The key of the last completed step. Every step up to and including the one after it is
   * navigable.
   */
  lastCompletedStep: Key | null;
  /**
   * Keys that are not navigable: steps beyond the last completed step, or every step but the
   * current one when read only.
   */
  disabledKeys: Set<Key>;
}

/**
 * Provides selection state for a `StepListTabs`. Single-selection and the "always one
 * selected" guarantee are delegated to the underlying `Tabs`/`useTabListState`; this hook
 * controls the selected step and tracks the last completed step so it can derive which steps
 * are navigable. Completed steps and the current step are navigable; upcoming steps are not.
 * The last completed step advances as the selection moves forward and is never rolled back, so
 * previously reached steps stay navigable after navigating backwards.
 */
export function useStepListTabsState(options: StepListTabsStateOptions): StepListTabsState {
  let {keys, isReadOnly = false, onSelectionChange} = options;
  let firstKey = keys.length > 0 ? keys[0] : null;

  let [selectedKeyState, setSelectedKey] = useControlledState<Key | null>(
    options.selectedKey,
    options.defaultSelectedKey ?? null,
    onSelectionChange
      ? key => {
          if (key != null) {
            onSelectionChange(key);
          }
        }
      : undefined
  );

  let selectedKey = selectedKeyState ?? firstKey;
  let selectedIndex = selectedKey != null ? keys.indexOf(selectedKey) : -1;

  let [lastCompletedStep, setLastCompletedStep] = useControlledState<Key | null>(
    options.lastCompletedStep,
    options.defaultLastCompletedStep ?? null,
    options.onLastCompletedStepChange
  );
  let lastCompletedIndex = lastCompletedStep != null ? keys.indexOf(lastCompletedStep) : -1;

  useEffect(() => {
    if (selectedIndex > lastCompletedIndex + 1 && selectedIndex > 0) {
      setLastCompletedStep(keys[selectedIndex - 1]);
    }
  }, [keys, selectedIndex, lastCompletedIndex, setLastCompletedStep]);

  let disabledKeys = useMemo(() => {
    let set = new Set<Key>();
    keys.forEach((key, i) => {
      if (key === selectedKey) {
        return;
      }
      if (isReadOnly) {
        set.add(key);
        return;
      }
      // Completed steps and the current step are navigable; upcoming steps are not.
      if (i > lastCompletedIndex + 1) {
        set.add(key);
      }
    });
    return set;
  }, [keys, selectedKey, lastCompletedIndex, isReadOnly]);

  return {
    selectedKey,
    setSelectedKey,
    lastCompletedStep,
    disabledKeys
  };
}
