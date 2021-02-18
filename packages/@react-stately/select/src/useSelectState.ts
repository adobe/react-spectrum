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

import {MenuTriggerState, useMenuTriggerState} from '@react-stately/menu';
import {SelectProps} from '@react-types/select';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {useState} from 'react';

export interface SelectState<T> extends SingleSelectListState<T>, MenuTriggerState {
  /** Whether the select is currently focused. */
  readonly isFocused: boolean,

  /** Sets whether the select is focused. */
  setFocused(isFocused: boolean): void
}

/**
 * Provides state management for a select component. Handles building a collection
 * of items from props, handles the open state for the popup menu, and manages
 * multiple selection state.
 */
export function useSelectState<T extends object>(props: SelectProps<T>): SelectState<T>  {
  let triggerState = useMenuTriggerState(props);
  let listState = useSingleSelectListState({
    ...props,
    onSelectionChange: (key) => {
      if (props.onSelectionChange != null) {
        props.onSelectionChange(key);
      }

      triggerState.close();
    }
  });

  let [isFocused, setFocused] = useState(false);

  return {
    ...listState,
    ...triggerState,
    open() {
      // Don't open if the collection is empty.
      if (listState.collection.size !== 0) {
        triggerState.open();
      }
    },
    toggle(focusStrategy) {
      if (listState.collection.size !== 0) {
        triggerState.toggle(focusStrategy);
      }
    },
    isFocused,
    setFocused
  };
}
