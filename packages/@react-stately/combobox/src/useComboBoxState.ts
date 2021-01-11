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

import {Collection, FocusStrategy, Node} from '@react-types/shared';
import {ComboBoxProps} from '@react-types/combobox';
import {ListCollection, useSingleSelectListState} from '@react-stately/list';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useMenuTriggerState} from '@react-stately/menu';

export interface ComboBoxState<T> extends SelectState<T> {
  inputValue: string,
  setInputValue(value: string): void,
  commit(): void
}

type FilterFn = (textValue: string, inputValue: string) => boolean;
interface ComboBoxStateProps<T> extends ComboBoxProps<T> {
  defaultFilter?: FilterFn,
  allowsEmptyCollection?: boolean,
  shouldCloseOnBlur?: boolean
}

export function useComboBoxState<T extends object>(props: ComboBoxStateProps<T>): ComboBoxState<T> {
  let {
    defaultFilter,
    menuTrigger = 'input',
    allowsEmptyCollection = false,
    allowsCustomValue,
    shouldCloseOnBlur = true
  } = props;

  let [isFocused, setFocusedState] = useState(false);
  let [inputValue, setInputValue] = useControlledState(
    props.inputValue,
    props.defaultInputValue ?? '',
    props.onInputChange
  );

  let {collection, selectionManager, selectedKey, setSelectedKey, selectedItem, disabledKeys} = useSingleSelectListState({
    ...props,
    items: props.items ?? props.defaultItems
  });

  let filteredCollection = useMemo(() => (
    // No default filter if items are controlled.
    props.items != null || !defaultFilter
      ? collection
      : filterCollection(collection, inputValue, defaultFilter)
  ), [collection, inputValue, defaultFilter, props.items]);

  let triggerState = useMenuTriggerState(props);
  let open = (focusStrategy?: FocusStrategy) => {
    // Prevent open operations from triggering if there is nothing to display
    if (allowsEmptyCollection || filteredCollection.size > 0) {
      triggerState.open(focusStrategy);
    }
  };

  let lastValue = useRef(inputValue);
  let resetInputValue = () => {
    let itemText = collection.getItem(selectedKey)?.textValue ?? '';
    lastValue.current = itemText;
    setInputValue(itemText);
  };

  let isInitialRender = useRef(true);
  let lastSelectedKey = useRef(null);
  useEffect(() => {
    // If open state or inputValue is uncontrolled, open and close automatically when the input value changes,
    // the input is if focused, and there are items in the collection.
    if (
      isFocused &&
      filteredCollection.size > 0 &&
      !triggerState.isOpen &&
      inputValue !== lastValue.current &&
      menuTrigger !== 'manual' &&
      (props.isOpen === undefined || props.inputValue === undefined)
    ) {
      open();
    }

    // Close the menu if the collection is empty and either open state or items are uncontrolled.
    if (
      !allowsEmptyCollection &&
      triggerState.isOpen &&
      filteredCollection.size === 0 &&
      (props.isOpen === undefined || props.items === undefined)
    ) {
      triggerState.close();
    }

    // Close when an item is selected, if open state or selectedKey is uncontrolled.
    if (
      selectedKey != null &&
      selectedKey !== lastSelectedKey.current &&
      (props.isOpen === undefined || props.selectedKey === undefined)
    ) {
      triggerState.close();
    }

    // Clear focused key when input value changes.
    if (inputValue !== lastValue.current) {
      selectionManager.setFocusedKey(null);

      // Set selectedKey to null when the user clears the input.
      // If controlled, this is the application developer's responsibility.
      if (inputValue === '' && (props.inputValue === undefined || props.selectedKey === undefined)) {
        setSelectedKey(null);
      }
    }

    // If the selectedKey changed, update the input value.
    // Do nothing if both inputValue and selectedKey are controlled.
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange. In addition, we preserve the defaultInputValue
    // on initial render, even if it doesn't match the selected item's text.
    if (
      selectedKey !== lastSelectedKey.current &&
      (props.inputValue === undefined || props.selectedKey === undefined) &&
      !(isInitialRender.current && props.defaultInputValue !== undefined)
    ) {
      resetInputValue();
    } else {
      lastValue.current = inputValue;
    }

    isInitialRender.current = false;
    lastSelectedKey.current = selectedKey;
  });

  useEffect(() => {
    // Reset focused key when the menu closes
    if (!triggerState.isOpen) {
      selectionManager.setFocusedKey(null);
    }
  }, [triggerState.isOpen, selectionManager]);

  let commitCustomValue = () => {
    let shouldClose = false;
    if (!allowsCustomValue) {
      resetInputValue();
      shouldClose = inputValue === lastValue.current;
    } else {
      lastSelectedKey.current = null;
      setSelectedKey(null);
      shouldClose = selectedKey === null;
    }

    // Close if no other event will be fired. Otherwise, allow the
    // application to control this based on that event.
    if (shouldClose) {
      triggerState.close();
    }
  };

  let commit = () => {
    if (triggerState.isOpen && selectionManager.focusedKey != null) {
      // Close here if the selected key is already the focused key. Otherwise
      // fire onSelectionChange to allow the application to control the closing.
      if (selectedKey === selectionManager.focusedKey) {
        triggerState.close();
      } else {
        setSelectedKey(selectionManager.focusedKey);
      }
    } else {
      commitCustomValue();
    }
  };

  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      if (menuTrigger === 'focus') {
        open();
      }
    } else if (shouldCloseOnBlur) {
      commitCustomValue();
    }

    setFocusedState(isFocused);
  };

  return {
    ...triggerState,
    open,
    selectionManager,
    selectedKey,
    setSelectedKey,
    disabledKeys,
    isFocused,
    setFocused,
    selectedItem,
    collection: filteredCollection,
    inputValue,
    setInputValue,
    commit
  };
}

function filterCollection<T extends object>(collection: Collection<Node<T>>, inputValue: string, filter: FilterFn): Collection<Node<T>> {
  return new ListCollection(filterNodes(collection, inputValue, filter));
}

function filterNodes<T>(nodes: Iterable<Node<T>>, inputValue: string, filter: FilterFn): Iterable<Node<T>> {
  let filteredNode = [];
  for (let node of nodes) {
    if (node.type === 'section' && node.hasChildNodes) {
      let filtered = filterNodes(node.childNodes, inputValue, filter);
      if ([...filtered].length > 0) {
        filteredNode.push({...node, childNodes: filtered});
      }
    } else if (node.type !== 'section' && filter(node.textValue, inputValue)) {
      filteredNode.push(node);
    }
  }
  return filteredNode;
}
