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

import {CollectionStateBase, FocusStrategy, Key, Node, Selection} from '@react-types/shared';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {ListState, useListState} from '@react-stately/list';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {SelectionMode, SelectProps, ValueType} from '@react-types/select';
import {useControlledState} from '@react-stately/utils';
import {useMemo, useState} from 'react';

export interface SelectStateOptions<T, M extends SelectionMode = 'single'> extends Omit<SelectProps<T, M>, 'children'>, CollectionStateBase<T> {}

export interface SelectState<T, M extends SelectionMode = 'single'> extends ListState<T>, OverlayTriggerState, FormValidationState {
  /**
   * The key for the first selected item.
   * @deprecated
   */
  readonly selectedKey: Key | null,

  /**
   * The default selected key.
   * @deprecated
   */
  readonly defaultSelectedKey: Key | null,

  /**
   * Sets the selected key.
   * @deprecated
   */
  setSelectedKey(key: Key | null): void,

  /** The current select value. */
  readonly value: ValueType<M>,

  /** The default select value. */
  readonly defaultValue: ValueType<M>,

  /** Sets the select value. */
  setValue(value: Key | Key[] | null): void,

  /**
   * The value of the first selected item.
   * @deprecated
   */
  readonly selectedItem: Node<T> | null,

  /** The value of the selected items. */
  readonly selectedItems: Node<T>[],

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
export function useSelectState<T extends object, M extends SelectionMode = 'single'>(props: SelectStateOptions<T, M>): SelectState<T, M>  {
  let {selectionMode = 'single' as M} = props;
  let triggerState = useOverlayTriggerState(props);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy | null>(null);
  let defaultValue = useMemo(() => {
    return props.defaultValue !== undefined ? props.defaultValue : (selectionMode === 'single' ? props.defaultSelectedKey ?? null : []) as ValueType<M>;
  }, [props.defaultValue, props.defaultSelectedKey, selectionMode]);
  let value = useMemo(() => {
    return props.value !== undefined ? props.value : (selectionMode === 'single' ? props.selectedKey : undefined) as ValueType<M>;
  }, [props.value, props.selectedKey, selectionMode]);
  let [controlledValue, setControlledValue] = useControlledState<Key | Key[] | null>(value, defaultValue, props.onChange as any);
  // Only display the first selected item if in single selection mode but the value is an array.
  let displayValue = selectionMode === 'single' && Array.isArray(controlledValue) ? controlledValue[0] : controlledValue;
  let setValue = (value: Key | Key[] | null) => {
    if (selectionMode === 'single') {
      let key = Array.isArray(value) ? value[0] ?? null : value;
      setControlledValue(key);
      if (key !== displayValue) {
        props.onSelectionChange?.(key);
      }
    } else {
      let keys: Key[] = [];
      if (Array.isArray(value)) {
        keys = value;
      } else if (value != null) {
        keys = [value];
      }

      setControlledValue(keys);
    }
  };

  let listState = useListState({
    ...props,
    selectionMode,
    disallowEmptySelection: selectionMode === 'single',
    allowDuplicateSelectionEvents: true,
    selectedKeys: useMemo(() => convertValue(displayValue), [displayValue]),
    onSelectionChange: (keys: Selection) => {
      // impossible, but TS doesn't know that
      if (keys === 'all') {
        return;
      }

      if (selectionMode === 'single') {
        let key = keys.values().next().value ?? null;
        setValue(key);
        triggerState.close();
      } else {
        setValue([...keys]);
      }

      validationState.commitValidation();
    }
  });

  let selectedKey = listState.selectionManager.firstSelectedKey;
  let selectedItems = useMemo(() => {
    return [...listState.selectionManager.selectedKeys].map(key => listState.collection.getItem(key)).filter(item => item != null);
  }, [listState.selectionManager.selectedKeys, listState.collection]);

  let validationState = useFormValidationState({
    ...props,
    value: Array.isArray(displayValue) && displayValue.length === 0 ? null : displayValue as any
  });

  let [isFocused, setFocused] = useState(false);
  let [initialValue] = useState(displayValue);

  return {
    ...validationState,
    ...listState,
    ...triggerState,
    value: displayValue as ValueType<M>,
    defaultValue: defaultValue ?? initialValue as ValueType<M>,
    setValue,
    selectedKey,
    setSelectedKey: setValue,
    selectedItem: selectedItems[0] ?? null,
    selectedItems,
    defaultSelectedKey: props.defaultSelectedKey ?? (props.selectionMode === 'single' ? initialValue as Key : null),
    focusStrategy,
    open(focusStrategy: FocusStrategy | null = null) {
      // Don't open if the collection is empty.
      if (listState.collection.size !== 0) {
        setFocusStrategy(focusStrategy);
        triggerState.open();
      }
    },
    toggle(focusStrategy: FocusStrategy | null = null) {
      if (listState.collection.size !== 0) {
        setFocusStrategy(focusStrategy);
        triggerState.toggle();
      }
    },
    isFocused,
    setFocused
  };
}

function convertValue(value: Key | Key[] | null | undefined) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
