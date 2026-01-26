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

import {Collection, CollectionStateBase, FocusStrategy, Key, Node, Selection} from '@react-types/shared';
import {ComboBoxProps, MenuTriggerAction, SelectionMode, ValueType} from '@react-types/combobox';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {getChildNodes} from '@react-stately/collections';
import {ListCollection, ListState, useListState} from '@react-stately/list';
import {OverlayTriggerState, useOverlayTriggerState} from '@react-stately/overlays';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useControlledState} from '@react-stately/utils';

export interface ComboBoxState<T, M extends SelectionMode = 'single'> extends ListState<T>, OverlayTriggerState, FormValidationState {
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
  /** The current combobox value. */
  readonly value: ValueType<M>,
  /** The default combobox value. */
  readonly defaultValue: ValueType<M>,
  /** Sets the combobox value. */
  setValue(value: Key | readonly Key[] | null): void,
  /**
   * The value of the first selected item.
   * @deprecated
   */
  readonly selectedItem: Node<T> | null,
  /** The value of the selected items. */
  readonly selectedItems: Node<T>[],
  /** The current value of the combo box input. */
  inputValue: string,
  /** The default value of the combo box input. */
  defaultInputValue: string,
  /** Sets the value of the combo box input. */
  setInputValue(value: string): void,
  /** Selects the currently focused item and updates the input value. */
  commit(): void,
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null,
  /** Whether the select is currently focused. */
  readonly isFocused: boolean,
  /** Sets whether the select is focused. */
  setFocused(isFocused: boolean): void,
  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void,
  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void,
  /** Resets the input value to the previously selected item's text if any and closes the menu.  */
  revert(): void
}

type FilterFn = (textValue: string, inputValue: string) => boolean;

export interface ComboBoxStateOptions<T, M extends SelectionMode = 'single'> extends Omit<ComboBoxProps<T, M>, 'children'>, CollectionStateBase<T> {
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
export function useComboBoxState<T extends object, M extends SelectionMode = 'single'>(props: ComboBoxStateOptions<T, M>): ComboBoxState<T> {
  let {
    defaultFilter,
    menuTrigger = 'input',
    allowsEmptyCollection = false,
    allowsCustomValue,
    shouldCloseOnBlur = true,
    selectionMode = 'single' as SelectionMode
  } = props;

  let [showAllItems, setShowAllItems] = useState(false);
  let [isFocused, setFocusedState] = useState(false);
  let [focusStrategy, setFocusStrategy] = useState<FocusStrategy | null>(null);

  let defaultValue = useMemo(() => {
    return props.defaultValue !== undefined ? props.defaultValue : (selectionMode === 'single' ? props.defaultSelectedKey ?? null : []) as ValueType<M>;
  }, [props.defaultValue, props.defaultSelectedKey, selectionMode]);
  let value = useMemo(() => {
    return props.value !== undefined ? props.value : (selectionMode === 'single' ? props.selectedKey : undefined) as ValueType<M>;
  }, [props.value, props.selectedKey, selectionMode]);
  let [controlledValue, setControlledValue] = useControlledState<Key | readonly Key[] | null>(value, defaultValue, props.onChange as any);
  // Only display the first selected item if in single selection mode but the value is an array.
  let displayValue: ValueType<M> = selectionMode === 'single' && Array.isArray(controlledValue) ? controlledValue[0] : controlledValue;

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

  let {
    collection,
    selectionManager,
    disabledKeys
  } = useListState({
    ...props,
    items: props.items ?? props.defaultItems,
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
        if (key === displayValue) {
          props.onSelectionChange?.(key);
          // If key is the same, reset the inputValue and close the menu
          // (scenario: user clicks on already selected option)
          resetInputValue();
          closeMenu();
        } else {
          setValue(key);
        }
      } else {
        setValue([...keys]);
      }
    }
  });

  let selectedKey = selectionMode === 'single' ? selectionManager.firstSelectedKey : null;
  let selectedItems = useMemo(() => {
    return [...selectionManager.selectedKeys].map(key => collection.getItem(key)).filter(item => item != null);
  }, [selectionManager.selectedKeys, collection]);

  let [inputValue, setInputValue] = useControlledState(
    props.inputValue,
    getDefaultInputValue(props.defaultInputValue, selectedKey, collection) || '',
    props.onInputChange
  );
  let [initialValue] = useState(displayValue);
  let [initialInputValue] = useState(inputValue);

  // Preserve original collection so we can show all items on demand
  let originalCollection = collection;
  let filteredCollection = useMemo(() => (
    // No default filter if items are controlled.
    props.items != null || !defaultFilter
      ? collection
      : filterCollection(collection, inputValue, defaultFilter)
  ), [collection, inputValue, defaultFilter, props.items]);
  let [lastCollection, setLastCollection] = useState(filteredCollection);

  // Track what action is attempting to open the menu
  let menuOpenTrigger = useRef<MenuTriggerAction | undefined>('focus');
  let onOpenChange = (open: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(open, open ? menuOpenTrigger.current : undefined);
    }

    selectionManager.setFocused(open);
    if (!open) {
      selectionManager.setFocusedKey(null);
    }
  };

  let triggerState = useOverlayTriggerState({...props, onOpenChange, isOpen: undefined, defaultOpen: undefined});
  let open = (focusStrategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
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
      setFocusStrategy(focusStrategy);
      triggerState.open();
    }
  };

  let toggle = (focusStrategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
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

    toggleMenu(focusStrategy);
  };

  let updateLastCollection = useCallback(() => {
    setLastCollection(showAllItems ? originalCollection : filteredCollection);
  }, [showAllItems, originalCollection, filteredCollection]);

  // If menu is going to close, save the current collection so we can freeze the displayed collection when the
  // user clicks outside the popover to close the menu. Prevents the menu contents from updating as the menu closes.
  let toggleMenu = useCallback((focusStrategy: FocusStrategy | null = null) => {
    if (triggerState.isOpen) {
      updateLastCollection();
    }

    setFocusStrategy(focusStrategy);
    triggerState.toggle();
  }, [triggerState, updateLastCollection]);

  let closeMenu = useCallback(() => {
    if (triggerState.isOpen) {
      updateLastCollection();
      triggerState.close();
    }
  }, [triggerState, updateLastCollection]);

  let [lastValue, setLastValue] = useState(inputValue);
  let resetInputValue = () => {
    let itemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
    setLastValue(itemText);
    setInputValue(itemText);
  };

  let lastValueRef = useRef(displayValue);
  let lastSelectedKeyText = useRef(
    selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : ''
  );
  // intentional omit dependency array, want this to happen on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Open and close menu automatically when the input value changes if the input is focused,
    // and there are items in the collection or allowEmptyCollection is true.
    if (
      isFocused &&
      (filteredCollection.size > 0 || allowsEmptyCollection) &&
      !triggerState.isOpen &&
      inputValue !== lastValue &&
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
      closeMenu();
    }

    // Close when an item is selected.
    if (
      displayValue != null &&
      displayValue !== lastValueRef.current &&
      selectionMode === 'single'
    ) {
      closeMenu();
    }

    // Clear focused key when input value changes and display filtered collection again.
    if (inputValue !== lastValue) {
      selectionManager.setFocusedKey(null);
      setShowAllItems(false);

      // Set value to null when the user clears the input.
      // If controlled, this is the application developer's responsibility.
      if (inputValue === '' && (props.inputValue === undefined || value === undefined)) {
        setValue(null);
      }
    }

    // If the selectedKey changed, update the input value.
    // Do nothing if both inputValue and selectedKey are controlled.
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange.
    if (
      displayValue !== lastValueRef.current &&
      (props.inputValue === undefined || value === undefined)
    ) {
      resetInputValue();
    } else if (lastValue !== inputValue) {
      setLastValue(inputValue);
    }

    // Update the inputValue if the selected item's text changes from its last tracked value.
    // This is to handle cases where a selectedKey is specified but the items aren't available (async loading) or the selected item's text value updates.
    // Only reset if the user isn't currently within the field so we don't erroneously modify user input.
    // If inputValue is controlled, it is the user's responsibility to update the inputValue when items change.
    let selectedItemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
    if (!isFocused && selectedKey != null && props.inputValue === undefined && selectedKey === lastValueRef.current) {
      if (lastSelectedKeyText.current !== selectedItemText) {
        setLastValue(selectedItemText);
        setInputValue(selectedItemText);
      }
    }

    lastValueRef.current = displayValue;
    lastSelectedKeyText.current = selectedItemText;
  });

  let validation = useFormValidationState({
    ...props,
    value: useMemo(() => Array.isArray(displayValue) && displayValue.length === 0 ? null : ({inputValue, value: displayValue as any, selectedKey}), [inputValue, selectedKey, displayValue])
  });

  // Revert input value and close menu
  let revert = () => {
    if (allowsCustomValue && selectedKey == null) {
      commitCustomValue();
    } else {
      commitSelection();
    }
  };

  let commitCustomValue = () => {
    let value = selectionMode === 'multiple' ? [] : null;
    lastValueRef.current = value as any;
    setValue(value);
    closeMenu();
  };

  let commitSelection = () => {
    // If multiple things are controlled, call onSelectionChange
    if (value !== undefined && props.inputValue !== undefined) {
      props.onSelectionChange?.(selectedKey);

      // Stop menu from reopening from useEffect
      let itemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
      setLastValue(itemText);
      closeMenu();
    } else {
      // If only a single aspect of combobox is controlled, reset input value and close menu for the user
      resetInputValue();
      closeMenu();
    }
  };

  const commitValue = () => {
    if (allowsCustomValue) {
      const itemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
      (inputValue === itemText) ? commitSelection() : commitCustomValue();
    } else {
      // Reset inputValue and close menu
      commitSelection();
    }
  };

  let commit = () => {
    if (triggerState.isOpen && selectionManager.focusedKey != null) {
      // Reset inputValue and close menu here if the selected key is already the focused key. Otherwise
      // fire onSelectionChange to allow the application to control the closing.
      if (selectedKey === selectionManager.focusedKey) {
        commitSelection();
      } else {
        selectionManager.select(selectionManager.focusedKey);
      }
    } else {
      commitValue();
    }
  };

  let valueOnFocus = useRef(inputValue);
  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      valueOnFocus.current = inputValue;
      if (menuTrigger === 'focus' && !props.isReadOnly) {
        open(null, 'focus');
      }
    } else {
      if (shouldCloseOnBlur) {
        commitValue();
      }

      if (inputValue !== valueOnFocus.current) {
        validation.commitValidation();
      }
    }

    setFocusedState(isFocused);
  };

  let displayedCollection = useMemo(() => {
    if (triggerState.isOpen) {
      if (showAllItems) {
        return originalCollection;
      } else {
        return filteredCollection;
      }
    } else {
      return lastCollection;
    }
  }, [triggerState.isOpen, originalCollection, filteredCollection, showAllItems, lastCollection]);

  let defaultSelectedKey = props.defaultSelectedKey ?? (props.selectionMode === 'single' ? initialValue as Key : null);

  return {
    ...validation,
    ...triggerState,
    focusStrategy,
    toggle,
    open,
    close: commitValue,
    selectionManager,
    value: displayValue as any,
    defaultValue: defaultValue ?? initialValue as any,
    setValue,
    selectedKey,
    selectedItems,
    defaultSelectedKey,
    setSelectedKey: setValue,
    disabledKeys,
    isFocused,
    setFocused,
    selectedItem: selectedItems[0] ?? null,
    collection: displayedCollection,
    inputValue,
    defaultInputValue: getDefaultInputValue(props.defaultInputValue, defaultSelectedKey, collection) ?? initialInputValue,
    setInputValue,
    commit,
    revert
  };
}

function filterCollection<T extends object>(collection: Collection<Node<T>>, inputValue: string, filter: FilterFn): Collection<Node<T>> {
  return new ListCollection(filterNodes(collection, collection, inputValue, filter));
}

function filterNodes<T>(collection: Collection<Node<T>>, nodes: Iterable<Node<T>>, inputValue: string, filter: FilterFn): Iterable<Node<T>> {
  let filteredNode: Node<T>[] = [];
  for (let node of nodes) {
    if (node.type === 'section' && node.hasChildNodes) {
      let filtered = filterNodes(collection, getChildNodes(node, collection), inputValue, filter);
      if ([...filtered].some(node => node.type === 'item')) {
        filteredNode.push({...node, childNodes: filtered});
      }
    } else if (node.type === 'item' && filter(node.textValue, inputValue)) {
      filteredNode.push({...node});
    } else if (node.type !== 'item') {
      filteredNode.push({...node});
    }
  }
  return filteredNode;
}


function getDefaultInputValue(defaultInputValue: string | null | undefined, selectedKey: Key | null, collection: Collection<Node<unknown>>) {
  if (defaultInputValue == null) {
    if (selectedKey != null) {
      return collection.getItem(selectedKey)?.textValue ?? '';
    }
  }

  return defaultInputValue;
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
