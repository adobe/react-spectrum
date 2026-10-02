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
import {TabListStateContext} from './Tabs';
import {useContext} from 'react';

export interface StepAria {
  /** Whether this step is the current (selected) step. */
  isCurrent: boolean;
  /** Whether this step has been completed (precedes the current step). */
  isCompleted: boolean;
}

export function useStep(key: Key | undefined): StepAria {
  let state = useContext(TabListStateContext);

  if (state == null || key == null || state.selectedKey == null) {
    return {isCurrent: false, isCompleted: false};
  }

  let isCurrent = state.selectedKey === key;

  // Walk backwards from the current step. If we reach this step, it precedes the current
  // step and is therefore completed.
  // Should be ok for performance, these step lists are generally short.
  let isCompleted = false;
  let cursor = state.collection.getKeyBefore(state.selectedKey);
  while (cursor != null) {
    if (cursor === key) {
      isCompleted = true;
      break;
    }
    cursor = state.collection.getKeyBefore(cursor);
  }

  return {isCurrent, isCompleted};
}
