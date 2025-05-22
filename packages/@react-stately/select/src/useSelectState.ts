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

import {CollectionStateBase, FocusStrategy} from '@react-types/shared';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {SelectProps} from '@react-types/select';
import {SingleSelectListState, useSingleSelectListState} from '@react-stately/list';
import {useMemo, useState} from 'react';

export interface SelectStateOptions<T> extends Omit<SelectProps<T>, 'children'>, CollectionStateBase<T> {}

export interface SelectState<T> extends SingleSelectListState<T>, OverlayTriggerState, FormValidationState {
  /** Whether the select is currently focused. */
  readonly isFocused: boolean,

  /** Sets whether the select is focused. */
  setFocused(isFocused: boolean): void,

  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null,

  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null): void,

  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null): void
}

/**
 * Provides state management for a select component. Handles building a collection
 * of items from props, handles the open state for the popup menu, and manages
 * multiple selection state.
 */
export function useSelectState<T extends object>(props: SelectStateOptions<T>): SelectState<T>  {
  let triggerState = useOverlayTriggerState(props);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy | null>(null);
  let listState = useSingleSelectListState({
    ...props,
    onSelectionChange: (key) => {
      if (props.onSelectionChange != null) {
        props.onSelectionChange(key);
      }

      triggerState.close();
      validationState.commitValidation();
    }
  });

  let validationState = useFormValidationState({
    ...props,
    value: listState.selectedKey
  });

  let [isFocused, setFocused] = useState(false);
  let isEmpty = useMemo(() => listState.collection.size === 0 || (listState.collection.size === 1 && listState.collection.getItem(listState.collection.getFirstKey()!)?.type === 'loader'), [listState.collection]);

  return {
    ...validationState,
    ...listState,
    ...triggerState,
    focusStrategy,
    open(focusStrategy: FocusStrategy | null = null) {
      // Don't open if the collection is empty.
      if (!isEmpty) {
        setFocusStrategy(focusStrategy);
        triggerState.open();
      }
    },
    toggle(focusStrategy: FocusStrategy | null = null) {
      if (!isEmpty) {
        setFocusStrategy(focusStrategy);
        triggerState.toggle();
      }
    },
    isFocused,
    setFocused
  };
}
