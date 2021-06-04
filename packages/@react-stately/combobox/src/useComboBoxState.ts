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
import {ComboBoxProps, MenuTriggerAction} from '@react-types/combobox';
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
  commit(): void,
  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void,
  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void,
  /** Resets the input value to the previously selected item's text if any and closes the menu.  */
  revert(): void
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

  let [showAllItems, setShowAllItems] = useState(false);
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

    // If key is the same, reset the inputValue and close the menu
    // (scenario: user clicks on already selected option)
    if (key === selectedKey) {
      resetInputValue();
      triggerState.close();
    }
  };

  let {collection, selectionManager, selectedKey, setSelectedKey, selectedItem, disabledKeys} = useSingleSelectListState({
    ...props,
    onSelectionChange,
    items: props.items ?? props.defaultItems
  });

  // Preserve original collection so we can show all items on demand
  let originalCollection = collection;
  let filteredCollection = useMemo(() => (
    // No default filter if items are controlled.
    props.items != null || !defaultFilter
      ? collection
      : filterCollection(collection, inputValue, defaultFilter)
  ), [collection, inputValue, defaultFilter, props.items]);

  // Track what action is attempting to open the menu
  let menuOpenTrigger = useRef('focus' as MenuTriggerAction);
  let onOpenChange = (open: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(open, open ? menuOpenTrigger.current : undefined);
    }
  };

  let triggerState = useMenuTriggerState({...props, onOpenChange, isOpen: undefined, defaultOpen: undefined});
  let open = (focusStrategy?: FocusStrategy, trigger?: MenuTriggerAction) => {
    let displayAllItems = (trigger === 'manual' || (trigger === 'focus' && menuTrigger === 'focus'));
    // Prevent open operations from triggering if there is nothing to display
    // Also prevent open operations from triggering if items are uncontrolled but defaultItems is empty, even if displayAllItems is true.
    // This is to prevent comboboxes with empty defaultItems from opening but allow controlled items comboboxes to open even if the inital list is empty (assumption is user will provide swap the empty list with a base list via onOpenChange returning `menuTrigger` manual)
    if (allowsEmptyCollection || filteredCollection.size > 0 || (displayAllItems && originalCollection.size > 0) || props.items) {
      if (displayAllItems && !triggerState.isOpen && props.items === undefined) {
        // Show all items if menu is manually opened. Only care about this if items are undefined
        setShowAllItems(true);
      }

      menuOpenTrigger.current = trigger;
      triggerState.open(focusStrategy);
    }
  };

  let toggle = (focusStrategy?: FocusStrategy, trigger?: MenuTriggerAction) => {
    let displayAllItems = (trigger === 'manual' || (trigger === 'focus' && menuTrigger === 'focus'));
    // If the menu is closed and there is nothing to display, early return so toggle isn't called to prevent extraneous onOpenChange
    if (!(allowsEmptyCollection || filteredCollection.size > 0 || (displayAllItems && originalCollection.size > 0) || props.items) && !triggerState.isOpen) {
      return;
    }

    if (displayAllItems && !triggerState.isOpen && props.items === undefined) {
      // Show all items if menu is toggled open. Only care about this if items are undefined
      setShowAllItems(true);
    }

    // Only update the menuOpenTrigger if menu is currently closed
    if (!triggerState.isOpen) {
      menuOpenTrigger.current = trigger;
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
  let lastSelectedKeyText = useRef(collection.getItem(selectedKey)?.textValue ?? '');
  // intentional omit dependency array, want this to happen on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Open and close menu automatically when the input value changes if the input is focused,
    // and there are items in the collection or allowEmptyCollection is true.
    if (
      isFocused &&
      (filteredCollection.size > 0 || allowsEmptyCollection) &&
      !triggerState.isOpen &&
      inputValue !== lastValue.current &&
      menuTrigger !== 'manual'
    ) {
      open(null, 'input');
    }

    // Close the menu if the collection is empty. Don't close menu if filtered collection size is 0
    // but we are currently showing all items via button press
    if (
      !showAllItems &&
      !allowsEmptyCollection &&
      triggerState.isOpen &&
      filteredCollection.size === 0
    ) {
      triggerState.close();
    }

    // Close when an item is selected.
    if (
      selectedKey != null &&
      selectedKey !== lastSelectedKey.current
    ) {
      triggerState.close();
    }

    // Clear focused key when input value changes and display filtered collection again.
    if (inputValue !== lastValue.current) {
      selectionManager.setFocusedKey(null);
      setShowAllItems(false);

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
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange.
    if (
      selectedKey !== lastSelectedKey.current &&
      (props.inputValue === undefined || props.selectedKey === undefined)
    ) {
      resetInputValue();
    } else {
      lastValue.current = inputValue;
    }

    // Update the inputValue if the selected item's text changes from its last tracked value.
    // This is to handle cases where a selectedKey is specified but the items aren't available (async loading) or the selected item's text value updates.
    // Only reset if the user isn't currently within the field so we don't erroneously modify user input.
    // If inputValue is controlled, it is the user's responsibility to update the inputValue when items change.
    let selectedItemText = collection.getItem(selectedKey)?.textValue ?? '';
    if (!isFocused && selectedKey != null && props.inputValue === undefined && selectedKey === lastSelectedKey.current) {
      if (lastSelectedKeyText.current !== selectedItemText) {
        lastValue.current = selectedItemText;
        setInputValue(selectedItemText);
      }
    }

    isInitialRender.current = false;
    lastSelectedKey.current = selectedKey;
    lastSelectedKeyText.current = selectedItemText;
  });

  useEffect(() => {
    // Reset focused key when the menu closes
    if (!triggerState.isOpen) {
      selectionManager.setFocusedKey(null);
    }
  }, [triggerState.isOpen, selectionManager]);

  // Revert input value and close menu
  let revert = () => {
    if (allowsCustomValue && selectedKey == null) {
      commitCustomValue();
    } else {
      commitSelection();
    }
  };

  let commitCustomValue = () => {
    lastSelectedKey.current = null;
    setSelectedKey(null);
    triggerState.close();
  };

  let commitSelection = () => {
    // If multiple things are controlled, call onSelectionChange
    if (props.selectedKey !== undefined && props.inputValue !== undefined) {
      props.onSelectionChange(selectedKey);

      // Stop menu from reopening from useEffect
      let itemText = collection.getItem(selectedKey)?.textValue ?? '';
      lastValue.current = itemText;
      triggerState.close();
    } else {
      // If only a single aspect of combobox is controlled, reset input value and close menu for the user
      resetInputValue();
      triggerState.close();
    }
  };

  let commit = () => {
    if (triggerState.isOpen && selectionManager.focusedKey != null) {
      // Reset inputValue and close menu here if the selected key is already the focused key. Otherwise
      // fire onSelectionChange to allow the application to control the closing.
      if (selectedKey === selectionManager.focusedKey) {
        commitSelection();
      } else {
        setSelectedKey(selectionManager.focusedKey);
      }
    } else if (allowsCustomValue) {
      commitCustomValue();
    } else {
      // Reset inputValue and close menu if no item is focused but user triggers a commit
      commitSelection();
    }
  };

  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      if (menuTrigger === 'focus') {
        open(null, 'focus');
      }
    } else if (shouldCloseOnBlur) {
      let itemText = collection.getItem(selectedKey)?.textValue ?? '';
      if (allowsCustomValue && inputValue !== itemText) {
        commitCustomValue();
      } else {
        commitSelection();
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
    collection: showAllItems ? originalCollection : filteredCollection,
    inputValue,
    setInputValue,
    commit,
    revert
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
      filteredNode.push({...node});
    }
  }
  return filteredNode;
}
