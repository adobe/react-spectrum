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


import {CollectionBase, SingleSelection} from '@react-types/shared';
import {Node, TreeCollection} from '@react-stately/collections';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useEffect, useMemo, useRef} from 'react';
import {useSelectState} from '@react-stately/select';

export interface ComboBoxState<T> extends SelectState<T> {
  value: string,
  setValue: (value: string) => void
}

interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection {
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  inputValue?: string,
  defaultInputValue?: string,
  onInputChange?: (value: string) => void,
  onFilter?: (value: string) => void,
  isFocused: boolean,
  collator: Intl.Collator
}

function filter<T>(nodes: Iterable<Node<T>>, filterFn: (node: Node<T>) => boolean) {
  let filteredNode = [];
  for (let node of nodes) {
    if (node.type === 'section' && node.hasChildNodes) {
      let copyOfNode = {...node};
      let copyOfChildNodes = copyOfNode.childNodes;
      let filtered = filter(copyOfChildNodes, filterFn);
      if ([...filtered].length > 0) {
        copyOfNode.childNodes = filtered;
        filteredNode.push(copyOfNode);
      }
    } else if (node.type !== 'section' && filterFn(node)) {
      filteredNode.push(node);
    }
  }
  return filteredNode;
}

export function useComboBoxState<T extends object>(props: ComboBoxProps<T>): ComboBoxState<T> {
  let {
    onFilter,
    selectedKey,
    defaultSelectedKey,
    inputValue,
    defaultInputValue,
    onInputChange,
    isFocused,
    isOpen,
    defaultOpen,
    collator
  } = props;

  let itemsControlled = !!onFilter;

  // Create a separate menu open state tracker so onOpenChange doesn't fire with open and close in quick succession
  // in cases where there aren't items to show
  // Note that this means onOpenChange won't fire for controlled open states
  let [menuIsOpen, setMenuIsOpen] = useControlledState(isOpen, defaultOpen || false, () => {});
  let selectState = useSelectState(props);

  let selectedKeyItem = selectedKey ? selectState.collection.getItem(selectedKey) : undefined;
  let selectedKeyText = selectedKeyItem ? selectedKeyItem.textValue : undefined;
  let defaultSelectedKeyItem = defaultSelectedKey ? selectState.collection.getItem(defaultSelectedKey) : undefined;
  let defaultSelectedKeyText = defaultSelectedKeyItem ? defaultSelectedKeyItem.textValue || defaultSelectedKeyItem.rendered as string : undefined;

  let [value, setValue] = useControlledState(toString(inputValue) || selectedKeyText, toString(defaultInputValue) || defaultSelectedKeyText || '', onInputChange);
  let lowercaseValue = value.toLowerCase().replace(' ', '');

  let defaultFilterFn = useMemo(() => (node: Node<T>) => {
    let scan = 0;
    let lowercaseNode = node.textValue.toLowerCase().replace(' ', '');
    let sliceLen = lowercaseValue.length;
    let match = false;

    for (; scan + sliceLen <= lowercaseNode.length && !match; scan++) {
      let nodeSlice = lowercaseNode.slice(scan, scan + sliceLen);
      let compareVal = collator.compare(lowercaseValue, nodeSlice);
      if (compareVal === 0) {
        match = true;
      }
    }

    return match;
  }, [collator, lowercaseValue]);

  let lastValue = useRef('');
  useEffect(() => {
    if (onFilter && lastValue.current !== value) {
      onFilter(value);
    }

    lastValue.current = value;
  }, [value, onFilter]);

  selectState.collection = useMemo(() => {
    if (itemsControlled || value === '') {
      return selectState.collection;
    }
    return new TreeCollection(filter(selectState.collection, defaultFilterFn), new Set());
  }, [selectState.collection, value, itemsControlled, defaultFilterFn]);

  useEffect(() => {
    // Close the menu if it was open but there aren't any items to display
    if (menuIsOpen && selectState.collection.size === 0) {
      selectState.close();
    }

    // Only open the menu if there are items to display and the combobox is focused
    // Note: doesn't affect controlled isOpen or defaultOpen
    if (isFocused && menuIsOpen && selectState.collection.size > 0) {
      selectState.open();
    }

    // Close the menu if it is supposed to be closed
    if (!menuIsOpen) {
      selectState.close();
    }

    // Maybe change dep array back to selectState? or make it selectState.close?
  }, [menuIsOpen, selectState.collection, selectState, isFocused]);

  let open = () => {
    setMenuIsOpen(true);
  };

  let close = () => {
    setMenuIsOpen(false);
  };

  let toggle = (focusStrategy = null) => {
    setMenuIsOpen(state => !state);
    selectState.setFocusStrategy(focusStrategy);
  };

  // Moved from aria to stately cuz it feels more like stately
  useEffect(() => {
    // Perhaps replace the below with state.selectedItem?
    let selectedItem = selectState.selectedKey ? selectState.collection.getItem(selectState.selectedKey) : null;
    if (selectedItem) {
      let itemText = selectedItem.textValue;

      // Throw error if controlled inputValue and controlled selectedKey don't match
      if (inputValue && selectedKey && (inputValue !== itemText)) {
        throw new Error('Mismatch between selected item and inputValue!');
      }

      // Update textfield value if new item is selected
      // Only do this if not controlled?
      if (itemText !== value && !(inputValue)) {
        setValue(itemText);
      }
    } else {
      if (inputValue) {
        // TODO find item that has matching text and set as selectedKey
        // If none found, make invalid?
        // Confirmed dig through all nodes and find the one with matching text
      }
    }
  // Double check this dependency array (does it need value,setValue, selectState.collection)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectState.selectedKey, inputValue, selectedKey]);

  return {
    ...selectState,
    open,
    close,
    toggle,
    value,
    setValue
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
