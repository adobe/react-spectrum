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

import {AriaStepListProps, StepListState} from '@react-types/steplist';
import {Collection, Node} from '@react-types/shared';
import {Key, useMemo} from 'react';
import {useControlledState} from '@react-stately/utils';
import {useSingleSelectListState} from '@react-stately/list';

export function useStepListState<T extends object>(props: AriaStepListProps<T>): StepListState<T> {
  let selectState = useSingleSelectListState<T>(props);
  let [lastCompletedStep, setLastCompletedStep] = useControlledState<Key>(props.lastCompletedStep, props.defaultCompletedStep, props.onLastCompletedStepChange);
  const collection = selectState.collection as Collection<Node<T>>;
  const keys = useMemo<Key[]>(() => iterToArr(collection.getKeys()), [collection]);
  const {setSelectedKey} = selectState;
  if (keys.indexOf(selectState.selectedKey) > keys.indexOf(lastCompletedStep)) {
    setLastCompletedStep(selectState.selectedKey);
  }
  const sls: StepListState<T> = {
    ...selectState,
    setSelectedKey: (key) => {
      const prevKey = prevStep(key);
      if (!isCompleted(prevKey)) {
        setLastCompletedStep(prevKey);  
      }
      setSelectedKey(key);
    },
    setLastCompletedStep,
    isCompleted,
    isNavigable
  };

  function isCompleted(step: Key) {
    return keys.indexOf(step) < keys.indexOf(lastCompletedStep);
  }

  function isNavigable(step: Key) {
    return !props.isDisabled && !props.isReadOnly &&
    (isCompleted(step) || isCompleted(prevStep(step)));
  }

  function prevStep(step: Key) {
    const prevIdx = keys.indexOf(step) - 1;
    if (prevIdx >= 0) {
      return keys[keys.indexOf(prevIdx)]; 
    }
    return undefined;
  }

  return sls;
}

function iterToArr<T>(iter: Iterable<T>): T[] {
  const arr = [];
  for (const i of iter) {
    arr.push(i);
  }
  return arr;
}
