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
  /** The current value of the combo box input. */
  inputValue: string,
  /** Sets the value of the combo box input. */
  setInputValue(value: string): void,
  /** Selects the currently focused item and updates the input value. */
  commit(): void
}

type FilterFn = (textValue: string, inputValue: string) => boolean;
interface ComboBoxStateProps<T> extends ComboBoxProps<T> {
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: FilterFn,
  /** Whether the combo box allows the menu to be open when the collection is empty. */
  allowsEmptyCollection?: boolean,
  /** Whether the combo box menu should close on blur. */
  shouldCloseOnBlur?: boolean
}

/**
 * Provides state management for a combo box component. Handles building a collection
 * of items from props and manages the option selection state of the combo box. In addition, it tracks the input value,
 * focus state, and other properties of the combo box.
 */
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

  let onSelectionChange = (key) => {
    if (props.onSelectionChange) {
      props.onSelectionChange(key);
    }

    // If open state or selectedKey is uncontrolled and key is the same, reset the inputValue and close the menu
    // (scenario: user clicks on already selected option)
    if (props.isOpen === undefined || props.selectedKey === undefined) {
      if (key === selectedKey) {
        resetInputValue();
        triggerState.close();
      }
    }
  };

  let {collection, selectionManager, selectedKey, setSelectedKey, selectedItem, disabledKeys} = useSingleSelectListState({
    ...props,
    onSelectionChange,
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

  let toggle = (focusStrategy?: FocusStrategy) => {
    // If the menu is closed and there is nothing to display, early return so toggle isn't called to prevent extraneous onOpenChange
    if (!(allowsEmptyCollection || filteredCollection.size > 0) && !triggerState.isOpen) {
      return;
    }

    triggerState.toggle(focusStrategy);
  };

  let lastValue = useRef(inputValue);
  let resetInputValue = () => {
    let itemText = collection.getItem(selectedKey)?.textValue ?? '';
    lastValue.current = itemText;
    setInputValue(itemText);
  };

  let isInitialRender = useRef(true);
  let lastSelectedKey = useRef(props.selectedKey ?? props.defaultSelectedKey ?? null);
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

    // If it is the intial render and inputValue isn't controlled nor has an intial value, set input to match current selected key if any
    if (isInitialRender.current && (props.inputValue === undefined && props.defaultInputValue === undefined)) {
      resetInputValue();
    }

    // If the selectedKey changed, update the input value.
    // Do nothing if both inputValue and selectedKey are controlled.
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange. In addition, we preserve the defaultInputValue
    // on initial render, even if it doesn't match the selected item's text.
    if (
      selectedKey !== lastSelectedKey.current &&
      (props.inputValue === undefined || props.selectedKey === undefined)
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
    lastSelectedKey.current = null;
    setSelectedKey(null);

    // If previous key was already null, need to manually call onSelectionChange since it won't be triggered by a setSelectedKey call
    // This allows the application to control whether or not to close the menu on custom value commit
    if (selectedKey === null && props.onSelectionChange) {
      props.onSelectionChange(null);
    }

    // Should close menu ourselves if component open state or selected key is uncontrolled and therefore won't be closed by a user defined event handler
    shouldClose = props.isOpen == null || props.selectedKey === undefined;


    // Close if no other event will be fired. Otherwise, allow the
    // application to control this based on that event.
    if (shouldClose) {
      triggerState.close();
    }
  };

  let commit = () => {
    if (triggerState.isOpen && selectionManager.focusedKey != null) {
      // Reset inputValue and close menu here if the selected key is already the focused key. Otherwise
      // fire onSelectionChange to allow the application to control the closing.
      if (selectedKey === selectionManager.focusedKey) {
        resetInputValue();
        triggerState.close();
      } else {
        setSelectedKey(selectionManager.focusedKey);
      }
    } else if (allowsCustomValue) {
      commitCustomValue();
    }
  };

  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      if (menuTrigger === 'focus') {
        open();
      }
    } else if (shouldCloseOnBlur) {
      let itemText = collection.getItem(selectedKey)?.textValue ?? '';
      if (allowsCustomValue && inputValue !== itemText) {
        commitCustomValue();
      } else {
        resetInputValue();
        // Close menu if blurring away from the combobox
        // Specifically handles case where user clicks away from the field
        triggerState.close();
      }
    }

    setFocusedState(isFocused);
  };

  return {
    ...triggerState,
    toggle,
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
