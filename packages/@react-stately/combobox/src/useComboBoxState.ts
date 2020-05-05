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
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {Key, useEffect, useMemo, useRef} from 'react';


import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {CollectionBuilder, Node, TreeCollection} from '@react-stately/collections';
import {useMenuTriggerState} from '@react-stately/menu';

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

function filter<T>(nodes: Iterable<Node<T>>, filterFn: (node: Node<T>) => boolean): Iterable<Node<T>> {
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

  let computeKeyFromValue = (value, collection) => {
    let key;
    for (let item of collection.iterable) {
      let itemText = item.textValue;
      if (itemText === value) {
        key = item.key;
        break;
      }
    }

    return key;
  };

  let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  let collection = useMemo(() => {
    let nodes = builder.build(props);
    return new TreeCollection(nodes, new Set());
  }, [builder, props]);

  if (props.selectedKey && props.inputValue) {
    let selectedItem = collection.getItem(props.selectedKey);
    let itemText = selectedItem ? selectedItem.textValue : '';
    if (itemText !== props.inputValue) {
      throw new Error('Mismatch between selected item and inputValue!');
    }  
  }

  let onInputChange = (value) => {
    if (props.onInputChange) {
      props.onInputChange(value);
    }

    let newSelectedKey = computeKeyFromValue(value, collection);

    if (newSelectedKey !== selectedKey) {
      if (props.onSelectionChange) {
        props.onSelectionChange(newSelectedKey);
      }
    }
  };

  // Problem: For comboboxes with props.selectedKey, onInputChange only fires once per unique key press (press 'a' a bunch).
  // Fixed by adding selected key text value to inputValue useControlledState
  // Problem: For a combobox with props.defaultSelectedKey, deleting the entire input field made the value reset to defaultSelectedKey since inputValue became ''
  // Fixed by adding defaultSelectedKeyText to this useControlledState below
  let initialSelectedKeyText = collection.getItem(props.selectedKey)?.textValue;
  let initialDefaultSelectedKeyText = collection.getItem(props.defaultSelectedKey)?.textValue;
  let [inputValue, setInputValue] = useControlledState(toString(props.inputValue) || initialSelectedKeyText, toString(props.defaultInputValue) || initialDefaultSelectedKeyText || '', onInputChange);

  let value;
  // Set value equal to whatever controlled prop exists (selectedKey or inputValue)
  // If neither exist, set equal to inputValue 
  // This if statement can probably go away in favor of "value = inputValue" if the above useControlledState retains the initialSelectedKeyText stuff in it
  if (props.selectedKey) {
    value = initialSelectedKeyText || '';
  } else if (props.inputValue) {
    value = toString(props.inputValue);
  } else {
    value = inputValue || '';
  }

  let selectedKey =  computeKeyFromValue(inputValue, collection);
  let selectedKeys = useMemo(() => selectedKey != null ? [selectedKey] : [], [selectedKey]);

  let setSelectedKey = (key) => {
    // if (key !== selectedKey) {
      let item = collection.getItem(key);
      let itemText = item ? item.textValue : '';
      setInputValue(itemText);
      triggerState.setOpen(false);
    // }
  };

  let selectionState = useMultipleSelectionState(
    {
      ...props,
      selectedKeys, 
      onSelectionChange: (keys) => setSelectedKey(keys.values().next().value),
      selectionMode: 'single'
    }
  );
  
  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);
  
  let triggerState = useMenuTriggerState(props);

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

  let filteredCollection = useMemo(() => {
    if (itemsControlled || value === '') {
      return collection;
    }
    return new TreeCollection(filter(collection, defaultFilterFn), new Set());
  }, [collection, value, itemsControlled, defaultFilterFn]);

  let selectionManager = new SelectionManager(filteredCollection, selectionState);

  useEffect(() => {
    // Close the menu if it was open but there aren't any items to display
    if (menuIsOpen && filteredCollection.size === 0) {
      triggerState.close();
    }

    // Only open the menu if there are items to display and the combobox is focused
    // Note: doesn't affect controlled isOpen or defaultOpen
    if (isFocused && menuIsOpen && filteredCollection.size > 0) {
      triggerState.open();
    }

    // Close the menu if it is supposed to be closed
    if (!menuIsOpen) {
      triggerState.close();
    }

    // Maybe change dep array back to selectState? or make it selectState.close?
  }, [menuIsOpen, filteredCollection, triggerState, isFocused]);

  let open = () => {
    setMenuIsOpen(true);
  };

  let close = () => {
    setMenuIsOpen(false);
  };

  let toggle = (focusStrategy = null) => {
    setMenuIsOpen(state => !state);
    triggerState.setFocusStrategy(focusStrategy);
  };

  let selectedItem = selectedKey
  ? collection.getItem(selectedKey)
  : null;

  return {
    ...triggerState,
    selectionManager,
    selectedKey,
    isFocused,
    selectedItem,
    collection: filteredCollection,
    disabledKeys,
    setFocused: () => {},
    open,
    close,
    toggle,
    value,
    setValue: setInputValue,
    setSelectedKey
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
