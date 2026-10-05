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

import {
  Collection,
  CollectionBase,
  CollectionStateBase,
  FocusableProps,
  FocusStrategy,
  HelpTextProps,
  InputBase,
  Key,
  LabelableProps,
  Node,
  Selection,
  TextInputBase,
  Validation,
  ValueBase
} from '@react-types/shared';
import {FormValidationState, useFormValidationState} from '../form/useFormValidationState';
import {getChildNodes} from '../collections/getChildNodes';
import {ListCollection} from '../list/ListCollection';
import {ListState, useListState} from '../list/useListState';
import {OverlayTriggerState, useOverlayTriggerState} from '../overlays/useOverlayTriggerState';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useControlledState} from '../utils/useControlledState';

export type MenuTriggerAction = 'focus' | 'input' | 'manual';
export type SelectionMode = 'single' | 'multiple';
export type ValueType<M extends SelectionMode> = M extends 'single' ? Key | null : readonly Key[];
export type ChangeValueType<M extends SelectionMode> = M extends 'single' ? Key | null : Key[];
type ValidationType<M extends SelectionMode> = M extends 'single' ? Key | null : Key[];

export interface ComboBoxValidationValue<M extends SelectionMode = 'single'> {
  /**
   * The selected key in the ComboBox.
   *
   * @deprecated
   */
  selectedKey: Key | null;
  /** The keys of the currently selected items. */
  value: ValidationType<M>;
  /** The value of the ComboBox input. */
  inputValue: string;
}

export interface ComboBoxProps<T, M extends SelectionMode = 'single'>
  extends
    CollectionBase<T>,
    InputBase,
    ValueBase<ValueType<M>, ChangeValueType<M>>,
    TextInputBase,
    Validation<ComboBoxValidationValue<M>>,
    FocusableProps<HTMLInputElement>,
    LabelableProps,
    HelpTextProps {
  /** The list of ComboBox items (uncontrolled). */
  defaultItems?: Iterable<T>;
  /** The list of ComboBox items (controlled). */
  items?: Iterable<T>;
  /**
   * Method that is called when the open state of the menu changes. Returns the new open state and
   * the action that caused the opening of the menu.
   */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void;
  /**
   * Whether single or multiple selection is enabled.
   *
   * @default 'single'
   */
  selectionMode?: M;
  /**
   * The currently selected key in the collection (controlled).
   *
   * @deprecated
   */
  selectedKey?: Key | null;
  /**
   * The initial selected key in the collection (uncontrolled).
   *
   * @deprecated
   */
  defaultSelectedKey?: Key | null;
  /**
   * Handler that is called when the selection changes.
   *
   * @deprecated
   */
  onSelectionChange?: (key: Key | null) => void;
  /** The value of the ComboBox input (controlled). */
  inputValue?: string;
  /** The default value of the ComboBox input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the ComboBox input value changes. */
  onInputChange?: (value: string) => void;
  /** Whether the ComboBox allows a non-item matching input value to be set. */
  allowsCustomValue?: boolean;
  // /**
  //  * Whether the Combobox should only suggest matching options or autocomplete the field with the nearest matching option.
  //  * @default 'suggest'
  //  */
  // completionMode?: 'suggest' | 'complete',
  /**
   * The interaction required to display the ComboBox menu.
   *
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction;
}

export interface ComboBoxState<T, M extends SelectionMode = 'single'>
  extends ListState<T>, OverlayTriggerState, FormValidationState {
  /**
   * The key for the first selected item.
   *
   * @deprecated
   */
  readonly selectedKey: Key | null;

  /**
   * The default selected key.
   *
   * @deprecated
   */
  readonly defaultSelectedKey: Key | null;
  /**
   * Sets the selected key.
   *
   * @deprecated
   */
  setSelectedKey(key: Key | null): void;
  /** The current combobox value. */
  readonly value: ValueType<M>;
  /** The default combobox value. */
  readonly defaultValue: ValueType<M>;
  /** Sets the combobox value. */
  setValue(value: Key | readonly Key[] | null): void;
  /**
   * The value of the first selected item.
   *
   * @deprecated
   */
  readonly selectedItem: Node<T> | null;
  /** The value of the selected items. */
  readonly selectedItems: Node<T>[];
  /** The current value of the combo box input. */
  inputValue: string;
  /** The default value of the combo box input. */
  defaultInputValue: string;
  /** Sets the value of the combo box input. */
  setInputValue(value: string): void;
  /** Selects the currently focused item and updates the input value. */
  commit(): void;
  /** Controls which item will be auto focused when the menu opens. */
  readonly focusStrategy: FocusStrategy | null;
  /** Whether the select is currently focused. */
  readonly isFocused: boolean;
  /** Sets whether the select is focused. */
  setFocused(isFocused: boolean): void;
  /** Opens the menu. */
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** Toggles the menu. */
  toggle(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** Resets the input value to the previously selected item's text if any and closes the menu. */
  revert(): void;
}

type FilterFn = (textValue: string, inputValue: string) => boolean;

export interface ComboBoxStateOptions<T, M extends SelectionMode = 'single'>
  extends Omit<ComboBoxProps<T, M>, 'children'>, CollectionStateBase<T> {
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: FilterFn;
  /** Whether the combo box allows the menu to be open when the collection is empty. */
  allowsEmptyCollection?: boolean;
  /** Whether the combo box menu should close on blur. */
  shouldCloseOnBlur?: boolean;
}

/**
 * Provides state management for a combo box component. Handles building a collection of items from
 * props and manages the option selection state of the combo box. In addition, it tracks the input
 * value, focus state, and other properties of the combo box.
 */
export function useComboBoxState<T, M extends SelectionMode = 'single'>(
  props: ComboBoxStateOptions<T, M>
): ComboBoxState<T, M> {
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
  let closedDueToEmpty = useRef(false);

  let defaultValue = useMemo(() => {
    return props.defaultValue !== undefined
      ? props.defaultValue
      : ((selectionMode === 'single' ? (props.defaultSelectedKey ?? null) : []) as ValueType<M>);
  }, [props.defaultValue, props.defaultSelectedKey, selectionMode]);
  let value = useMemo(() => {
    return props.value !== undefined
      ? props.value
      : ((selectionMode === 'single' ? props.selectedKey : undefined) as ValueType<M>);
  }, [props.value, props.selectedKey, selectionMode]);
  let [controlledValue, setControlledValue] = useControlledState<Key | readonly Key[] | null>(
    value,
    defaultValue,
    props.onChange as any
  );
  // Only display the first selected item if in single selection mode but the value is an array.
  let displayValue: ValueType<M> =
    selectionMode === 'single' && Array.isArray(controlledValue)
      ? controlledValue[0]
      : controlledValue;

  let setValue = (value: Key | Key[] | null) => {
    if (selectionMode === 'single') {
      let key = Array.isArray(value) ? (value[0] ?? null) : value;
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

  let {collection, selectionManager, disabledKeys} = useListState({
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
    return [...selectionManager.selectedKeys]
      .map(key => collection.getItem(key))
      .filter(item => item != null);
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
  let filteredCollection = useMemo(
    () =>
      // No default filter if items are controlled.
      props.items != null || !defaultFilter
        ? collection
        : filterCollection(collection, inputValue, defaultFilter),
    [collection, inputValue, defaultFilter, props.items]
  );
  let [lastDisplayedCollection, setLastDisplayedCollection] = useState(filteredCollection);

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

  let triggerState = useOverlayTriggerState({
    ...props,
    onOpenChange,
    isOpen: undefined,
    defaultOpen: undefined
  });
  let open = (focusStrategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
    let displayAllItems = trigger === 'manual' || (trigger === 'focus' && menuTrigger === 'focus');
    // Only open if there are items to display, unless empty collections are allowed or items are controlled.
    // Controlled items may initially be empty and populated by the application in onOpenChange.
    if (
      allowsEmptyCollection ||
      filteredCollection.size > 0 ||
      (displayAllItems && originalCollection.size > 0) ||
      props.items
    ) {
      if (displayAllItems && !triggerState.isOpen && props.items === undefined) {
        // Show all items when opening manually or on focus, unless items are controlled.
        setShowAllItems(true);
      }

      menuOpenTrigger.current = trigger;
      setFocusStrategy(focusStrategy);
      triggerState.open();
    }
  };

  // Save the current collection before closing so the menu contents stay frozen as the popover closes.
  let updateLastDisplayedCollection = useCallback(() => {
    setLastDisplayedCollection(showAllItems ? originalCollection : filteredCollection);
  }, [showAllItems, originalCollection, filteredCollection]);

  let toggle = (focusStrategy: FocusStrategy | null = null, trigger?: MenuTriggerAction) => {
    if (!triggerState.isOpen) {
      open(focusStrategy, trigger);
    } else {
      updateLastDisplayedCollection();
      setFocusStrategy(focusStrategy);
      triggerState.toggle();
    }
  };

  let closeMenu = useCallback(() => {
    if (triggerState.isOpen) {
      updateLastDisplayedCollection();
      triggerState.close();
    }
  }, [triggerState, updateLastDisplayedCollection]);

  let getSelectedItemText = () =>
    selectedKey != null ? (collection.getItem(selectedKey)?.textValue ?? '') : '';

  // Input changes are compared against this baseline. Programmatic resets advance it too,
  // so they don't reopen the menu. Keep it in state so a rejected controlled update is reconciled.
  let [inputValueBaseline, setInputValueBaseline] = useState(inputValue);
  let resetInputValue = () => {
    let itemText = getSelectedItemText();
    setInputValueBaseline(itemText);
    setInputValue(itemText);
  };

  // Track selection changes separately from input changes. Committing a custom value advances
  // this ref before clearing the selection, preserving the custom text during reconciliation.
  let selectionBaseline = useRef(displayValue);
  let lastSelectedItemText = useRef(getSelectedItemText());

  // Reconcile after every render, in order. Keep ref-dependent decisions next to their updates,
  // since callbacks in earlier steps may synchronously change the refs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let inputChanged = inputValue !== inputValueBaseline;

    let shouldOpenOnInput =
      isFocused &&
      (filteredCollection.size > 0 || allowsEmptyCollection) &&
      !triggerState.isOpen &&
      inputChanged &&
      menuTrigger !== 'manual';
    if (shouldOpenOnInput) {
      // oxlint-disable-next-line react/react-compiler
      open(null, 'input');
    }

    // Close the menu if the collection is empty. Don't close menu if filtered collection size is 0
    // but we are currently showing all items via button press
    let shouldCloseOnEmpty =
      !showAllItems &&
      !allowsEmptyCollection &&
      triggerState.isOpen &&
      filteredCollection.size === 0;
    if (shouldCloseOnEmpty) {
      closedDueToEmpty.current = true;
      closeMenu();
    }

    // Re-open the menu when items become non-empty after being auto-closed due to
    // an empty collection (e.g. async load completed with results after a previous empty response).
    // This works for both controlled items on ComboBox and Collection patterns
    // (where items are provided on the ListBox rather than the ComboBox).
    let shouldReopenOnItems =
      isFocused &&
      closedDueToEmpty.current &&
      filteredCollection.size > 0 &&
      !triggerState.isOpen &&
      menuTrigger !== 'manual';
    if (shouldReopenOnItems) {
      closedDueToEmpty.current = false;
      open(null, 'input');
    }

    let shouldCloseOnSelection =
      displayValue != null &&
      displayValue !== selectionBaseline.current &&
      selectionMode === 'single';
    if (shouldCloseOnSelection) {
      closeMenu();
    }

    // Clear focused key when input value changes and display filtered collection again.
    if (inputChanged) {
      selectionManager.setFocusedKey(null);
      setShowAllItems(false);

      // Set value to null when the user clears the input.
      // If controlled, this is the application developer's responsibility.
      let shouldClearSelection =
        selectionMode === 'single' &&
        inputValue === '' &&
        (props.inputValue === undefined || value === undefined);
      if (shouldClearSelection) {
        setValue(null);
      }
    }

    // If the value changed, update the input value.
    // Do nothing if both inputValue and value are controlled.
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange.
    let shouldResetInputValue =
      displayValue !== selectionBaseline.current &&
      (props.inputValue === undefined || value === undefined);
    if (shouldResetInputValue) {
      resetInputValue();
    } else if (inputChanged) {
      setInputValueBaseline(inputValue);
    }

    // Update the inputValue if the selected item's text changes from its last tracked value.
    // This is to handle cases where a selectedKey is specified but the items aren't available (async loading) or the selected item's text value updates.
    // Only reset if the user isn't currently within the field so we don't erroneously modify user input.
    // If inputValue is controlled, it is the user's responsibility to update the inputValue when items change.
    let selectedItemText = getSelectedItemText();
    let shouldUpdateSelectedItemText =
      !isFocused &&
      selectedKey != null &&
      props.inputValue === undefined &&
      selectedKey === selectionBaseline.current &&
      lastSelectedItemText.current !== selectedItemText;
    if (shouldUpdateSelectedItemText) {
      setInputValueBaseline(selectedItemText);
      setInputValue(selectedItemText);
    }

    selectionBaseline.current = displayValue;
    lastSelectedItemText.current = selectedItemText;
  });

  let validation = useFormValidationState({
    ...props,
    value: useMemo(
      () =>
        Array.isArray(displayValue) && displayValue.length === 0
          ? null
          : {inputValue, value: displayValue as any, selectedKey},
      [inputValue, selectedKey, displayValue]
    )
  });

  // Revert input value and close menu
  let revert = () => {
    closedDueToEmpty.current = false;
    if (allowsCustomValue && selectedKey == null) {
      commitCustomValue();
    } else {
      commitSelection();
    }
  };

  let commitCustomValue = () => {
    if (selectionMode === 'multiple') {
      // In multi-select mode, the input's custom text is independent from the selected items.
      // Closing or committing the field should not clear the existing selection.
      setInputValueBaseline(inputValue);
      closeMenu();
      return;
    }

    let value = null;
    selectionBaseline.current = value as any;
    setValue(value);
    closeMenu();
  };

  let commitSelection = (shouldForceSelectionChange = false) => {
    // If multiple things are controlled, call onSelectionChange only when selecting the focused item,
    // or when inputValue needs to be synced back to the selected item on commit/blur.
    if (value !== undefined && props.inputValue !== undefined) {
      let itemText = getSelectedItemText();
      if (shouldForceSelectionChange || selectionMode === 'multiple' || inputValue !== itemText) {
        props.onSelectionChange?.(selectedKey);
        props.onChange?.(displayValue as ChangeValueType<M>);
      }

      // Stop menu from reopening from useEffect
      setInputValueBaseline(itemText);
      closeMenu();
    } else {
      // If only a single aspect of combobox is controlled, reset input value and close menu for the user
      resetInputValue();
      closeMenu();
    }
  };

  const commitValue = () => {
    closedDueToEmpty.current = false;
    if (allowsCustomValue) {
      const itemText = getSelectedItemText();
      inputValue === itemText ? commitSelection() : commitCustomValue();
    } else {
      // Reset inputValue and close menu
      commitSelection();
    }
  };

  let commit = () => {
    if (triggerState.isOpen && selectionManager.focusedKey != null) {
      // Reset inputValue and close menu here if the selected key is already the focused key. Otherwise
      // fire onSelectionChange to allow the application to control the closing.
      if (selectionManager.isSelected(selectionManager.focusedKey) && selectionMode === 'single') {
        commitSelection(true);
      } else {
        selectionManager.select(selectionManager.focusedKey);
      }
    } else {
      commitValue();
    }
  };

  let valueOnFocus = useRef([inputValue, displayValue]);
  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      valueOnFocus.current = [inputValue, displayValue];
      if (menuTrigger === 'focus' && !props.isReadOnly) {
        open(null, 'focus');
      }
    } else {
      if (shouldCloseOnBlur) {
        commitValue();
      }

      // Commit validation if the input value or selected items changed.
      if (inputValue !== valueOnFocus.current[0] || displayValue !== valueOnFocus.current[1]) {
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
      return lastDisplayedCollection;
    }
  }, [
    triggerState.isOpen,
    originalCollection,
    filteredCollection,
    showAllItems,
    lastDisplayedCollection
  ]);

  let defaultSelectedKey =
    props.defaultSelectedKey ?? (selectionMode === 'single' ? (initialValue as Key) : null);

  return {
    ...validation,
    ...triggerState,
    focusStrategy,
    toggle,
    open,
    close: commitValue,
    selectionManager,
    value: displayValue as any,
    defaultValue: defaultValue ?? (initialValue as any),
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
    defaultInputValue:
      getDefaultInputValue(props.defaultInputValue, defaultSelectedKey, collection) ??
      initialInputValue,
    setInputValue,
    commit,
    revert
  };
}

function filterCollection<T>(
  collection: Collection<Node<T>>,
  inputValue: string,
  filter: FilterFn
): Collection<Node<T>> {
  return new ListCollection(filterNodes(collection, collection, inputValue, filter));
}

function filterNodes<T>(
  collection: Collection<Node<T>>,
  nodes: Iterable<Node<T>>,
  inputValue: string,
  filter: FilterFn
): Iterable<Node<T>> {
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

function getDefaultInputValue(
  defaultInputValue: string | null | undefined,
  selectedKey: Key | null,
  collection: Collection<Node<unknown>>
) {
  if (defaultInputValue == null) {
    if (selectedKey != null) {
      return collection.getItem(selectedKey)?.textValue ?? '';
    }
  }

  return defaultInputValue;
}

function convertValue(value: Key | readonly Key[] | null | undefined) {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
