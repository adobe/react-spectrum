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

import {Collection, CollectionBase, CollectionStateBase, FocusableProps, HelpTextProps, InputBase, Key, LabelableProps, Node, SingleSelection, TextInputBase, Validation} from '@react-types/shared';
import {FormValidationState, useFormValidationState} from '@react-stately/form';
import {getChildNodes} from '@react-stately/collections';
import {ListCollection, useSingleSelectListState} from '@react-stately/list';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useMemo, useRef, useState} from 'react';

export interface AutocompleteState<T> extends Omit<SelectState<T>, 'focusStrategy' | 'open' | 'close' | 'toggle' | 'isOpen' | 'setOpen'>, FormValidationState{
  /** The current value of the autocomplete input. */
  inputValue: string,
  /** Sets the value of the autocomplete input. */
  setInputValue(value: string): void,
  /** Selects the currently focused item and updates the input value. */
  commit(): void,
  /** Resets the input value to the previously selected item's text if any.  */
  revert(): void
}

type FilterFn = (textValue: string, inputValue: string) => boolean;

// TODO the below interface and props are pretty much copied from combobox props but without onOpenChange and any other open related ones. See if we need to remove anymore
interface AutocompleteValidationValue {
  /** The selected key in the autocomplete. */
  selectedKey: Key | null,
  /** The value of the autocomplete input. */
  inputValue: string
}

export interface AutocompleteProps<T> extends CollectionBase<T>, Omit<SingleSelection, 'disallowEmptySelection' | 'onSelectionChange'>, InputBase, TextInputBase, Validation<AutocompleteValidationValue>, FocusableProps<HTMLInputElement>, LabelableProps, HelpTextProps {
  /** The list of autocomplete items (uncontrolled). */
  defaultItems?: Iterable<T>,
  /** The list of autocomplete items (controlled). */
  items?: Iterable<T>,
  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: Key | null) => void,
  /** The value of the autocomplete input (controlled). */
  inputValue?: string,
  /** The default value of the autocomplete input (uncontrolled). */
  defaultInputValue?: string,
  /** Handler that is called when the autocomplete input value changes. */
  onInputChange?: (value: string) => void,
  /** Whether the autocomplete allows a non-item matching input value to be set. */
  allowsCustomValue?: boolean
}

export interface AutocompleteStateOptions<T> extends Omit<AutocompleteProps<T>, 'children'>, CollectionStateBase<T> {
  /** The filter function used to determine if a option should be included in the autocomplete list. */
  defaultFilter?: FilterFn
}

/**
 * Provides state management for a autocomplete component. Handles building a collection
 * of items from props and manages the option selection state of the autocomplete component. In addition, it tracks the input value,
 * focus state, and other properties of the autocomplete.
 */
export function useAutocompleteState<T extends object>(props: AutocompleteStateOptions<T>): AutocompleteState<T> {
  let {
    defaultFilter,
    allowsCustomValue
  } = props;

  let [isFocused, setFocusedState] = useState(false);

  let onSelectionChange = (key) => {
    if (props.onSelectionChange) {
      props.onSelectionChange(key);
    }

    // If key is the same, reset the inputValue
    // (scenario: user clicks on already selected option)
    if (key === selectedKey) {
      resetInputValue();
    }
  };

  let {collection,
    selectionManager,
    selectedKey,
    setSelectedKey,
    selectedItem,
    disabledKeys
  } = useSingleSelectListState({
    ...props,
    onSelectionChange,
    items: props.items ?? props.defaultItems
  });
  let defaultInputValue: string | null | undefined = props.defaultInputValue;
  if (defaultInputValue == null) {
    if (selectedKey == null) {
      defaultInputValue = '';
    } else {
      defaultInputValue = collection.getItem(selectedKey)?.textValue ?? '';
    }
  }

  let [inputValue, setInputValue] = useControlledState(
    props.inputValue,
    defaultInputValue!,
    props.onInputChange
  );

  let filteredCollection = useMemo(() => (
    // No default filter if items are controlled.
    props.items != null || !defaultFilter
      ? collection
      : filterCollection(collection, inputValue, defaultFilter)
  ), [collection, inputValue, defaultFilter, props.items]);

  // TODO: maybe revisit and see if we can simplify it more at all
  let [lastValue, setLastValue] = useState(inputValue);
  let resetInputValue = () => {
    let itemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
    setLastValue(itemText);
    setInputValue(itemText);
  };

  let lastSelectedKey = useRef(props.selectedKey ?? props.defaultSelectedKey ?? null);
  let lastSelectedKeyText = useRef(
    selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : ''
  );
  // intentional omit dependency array, want this to happen on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Clear focused key when input value changes.
    if (inputValue !== lastValue) {
      selectionManager.setFocusedKey(null);

      // Set selectedKey to null when the user clears the input.
      // If controlled, this is the application developer's responsibility.
      if (inputValue === '' && (props.inputValue === undefined || props.selectedKey === undefined)) {
        setSelectedKey(null);
      }
    }

    // If the selectedKey changed, update the input value.
    // Do nothing if both inputValue and selectedKey are controlled.
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange.
    if (
      selectedKey !== lastSelectedKey.current &&
      (props.inputValue === undefined || props.selectedKey === undefined)
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
    if (!isFocused && selectedKey != null && props.inputValue === undefined && selectedKey === lastSelectedKey.current) {
      if (lastSelectedKeyText.current !== selectedItemText) {
        setLastValue(selectedItemText);
        setInputValue(selectedItemText);
      }
    }

    lastSelectedKey.current = selectedKey;
    lastSelectedKeyText.current = selectedItemText;
  });

  let validation = useFormValidationState({
    ...props,
    value: useMemo(() => ({inputValue, selectedKey}), [inputValue, selectedKey])
  });

  // Revert input value
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
  };

  let commitSelection = () => {
    // If multiple things are controlled, call onSelectionChange
    if (props.selectedKey !== undefined && props.inputValue !== undefined) {
      props.onSelectionChange?.(selectedKey);
      let itemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
      setLastValue(itemText);
    } else {
      // If only a single aspect of autocomplete is controlled, reset input value
      resetInputValue();
    }
  };

  const commitValue = () => {
    if (allowsCustomValue) {
      const itemText = selectedKey != null ? collection.getItem(selectedKey)?.textValue ?? '' : '';
      (inputValue === itemText) ? commitSelection() : commitCustomValue();
    } else {
      // Reset inputValue
      commitSelection();
    }
  };

  let commit = () => {
    // Reset inputValue if the selected key is already the focused key. Otherwise
    // fire onSelectionChange to allow the application to control the closing.
    if (selectedKey === selectionManager.focusedKey) {
      commitSelection();
    } else {
      setSelectedKey(selectionManager.focusedKey);
    }
  };

  let valueOnFocus = useRef(inputValue);
  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      valueOnFocus.current = inputValue;
    } else {
      commitValue();

      if (inputValue !== valueOnFocus.current) {
        validation.commitValidation();
      }
    }

    setFocusedState(isFocused);
  };

  return {
    ...validation,
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
