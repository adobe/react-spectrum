/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Collection, CollectionBase, Key, Node, SingleSelection} from '@react-types/shared';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {useCallback, useEffect, useMemo} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface StepListProps<T> extends CollectionBase<T>, SingleSelection {
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: Key,
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key,
  /** Callback for when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void,
  /** Whether the step list is disabled. Steps will not be focusable or interactive. */
  isDisabled?: boolean,
  /** Whether the step list is read only. Steps will be focusable but non-interactive. */
  isReadOnly?: boolean
}

export interface StepListState<T> extends SingleSelectListState<T> {
  readonly lastCompletedStep?: Key,
  setLastCompletedStep(key: Key): void,
  isCompleted(key: Key): boolean,
  isSelectable(key: Key): boolean
}

export function useStepListState<T extends object>(props: StepListProps<T>): StepListState<T> {
  let state = useSingleSelectListState<T>(props);

  let [lastCompletedStep, setLastCompletedStep] = useControlledState<Key | null>(props.lastCompletedStep, props.defaultLastCompletedStep ?? null, props.onLastCompletedStepChange);
  const {setSelectedKey: realSetSelectedKey, selectedKey, collection} = state;
  const {indexMap, keysLinkedList} = useMemo(() => buildKeysMaps(collection), [collection]);
  const selectedIdx = selectedKey != null ? indexMap.get(selectedKey) : 0;

  const isCompleted = useCallback((step: Key | null | undefined) => {
    if (step === undefined) {
      return false;
    }

    return (step !== null &&
      lastCompletedStep !== null &&
      indexMap.has(step) &&
      indexMap.has(lastCompletedStep) &&
      indexMap.get(step)! <= indexMap.get(lastCompletedStep)!);
  }, [indexMap, lastCompletedStep]);

  const findDefaultSelectedKey = useCallback((collection: Collection<Node<T>> | null, disabledKeys: Set<Key>) => {
    let selectedKey: Key | null = null;
    if (collection && collection.size > 0) {
      selectedKey = collection.getFirstKey();
      // loop over keys until we find one that isn't completed or disabled and select that
      while (selectedKey !== collection.getLastKey() && selectedKey && (disabledKeys.has(selectedKey) || isCompleted(selectedKey))) {
        selectedKey = collection.getKeyAfter(selectedKey);
      }
    }

    return selectedKey;
  }, [isCompleted]);

  useEffect(() => {
    // Ensure a step is always selected (in case no selected key was specified or if selected item was deleted from collection)
    let selectedKey: Key | null = state.selectedKey;
    if (state.selectionManager.isEmpty || selectedKey == null || !state.collection.getItem(selectedKey)) {
      selectedKey = findDefaultSelectedKey(state.collection, state.disabledKeys);
      if (selectedKey !== null) {
        state.selectionManager.replaceSelection(selectedKey);
      }
    }

    if (state.selectionManager.focusedKey == null) {
      state.selectionManager.setFocusedKey(selectedKey);
    }

    let lcs = (lastCompletedStep !== null ? indexMap.get(lastCompletedStep) : -1) ?? -1;
    if (selectedIdx !== undefined && selectedIdx > 0 && selectedIdx > lcs + 1 && selectedKey !== null && keysLinkedList.has(selectedKey)) {
      setLastCompletedStep(keysLinkedList.get(selectedKey)!);
    }
  });

  function isSelectable(step: Key) {
    if (props.isDisabled || state.disabledKeys.has(step) || props.isReadOnly) {
      return false;
    }

    if (isCompleted(step)) {
      return true;
    }

    const prevStep = keysLinkedList.get(step);
    return isCompleted(prevStep) || step === state.collection.getFirstKey();
  }

  function setSelectedKey(key: Key) {
    const prevKey = keysLinkedList.get(key);
    if (prevKey && !isCompleted(prevKey)) {
      setLastCompletedStep(prevKey);
    }
    realSetSelectedKey(key);
  }

  return {
    ...state,
    setSelectedKey,
    setLastCompletedStep,
    isCompleted,
    isSelectable
  };
}

function buildKeysMaps<T>(coll: Collection<Node<T>>) {
  const indexMap = new Map<Key, number>();
  const keysLinkedList = new Map<Key, Key | undefined>();
  let i = 0;
  let prev: Node<T> | undefined = undefined;
  for (const item of coll) {
    indexMap.set(item.key, i);
    keysLinkedList.set(item.key, prev?.key);
    prev = item;
    i++;
  }
  return {
    indexMap,
    keysLinkedList
  };
}
