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

import {CollectionBuilder} from '@react-stately/collections';
import {ComboBoxProps} from '@react-types/combobox';
import {Key, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Node} from '@react-types/shared';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {SelectState} from '@react-stately/select';
import {TreeCollection} from '@react-stately/tree';
import {useControlledState} from '@react-stately/utils';
import {useMenuTriggerState} from '@react-stately/menu';

export interface ComboBoxState<T> extends SelectState<T> {
  inputValue: string,
  setInputValue: (value: string) => void
}

interface ComboBoxStateProps<T> extends ComboBoxProps<T> {
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

export function useComboBoxState<T extends object>(props: ComboBoxStateProps<T>): ComboBoxState<T> {
  let {
    onFilter,
    collator,
    onSelectionChange
  } = props;

  let [isFocused, setFocused] = useState(false);
  let itemsControlled = !!onFilter;

  let computeKeyFromValue = (value, collection) => {
    let key;
    for (let [itemKey, node] of collection.keyMap) {
      if (node.type !== 'section') {
        let itemText = node.textValue;
        if (itemText === value) {
          key = itemKey;
          break;
        }
      }
    }

    return key;
  };

  let builder = useMemo(() => new CollectionBuilder<T>(), []);
  let collection = useMemo(() => {
    let nodes = builder.build(props);
    return new TreeCollection(nodes, {expandedKeys: new Set()});
  }, [builder, props]);

  if (props.selectedKey && props.inputValue) {
    let selectedItem = collection.getItem(props.selectedKey);
    let itemText = selectedItem ? selectedItem.textValue : '';
    if (itemText !== props.inputValue) {
      throw new Error('Mismatch between selected item and inputValue!');
    }
  }

  let lastSelectedKey = useRef('');
  let onInputChange = (value) => {
    if (props.onInputChange) {
      props.onInputChange(value);
    }

    let newSelectedKey = computeKeyFromValue(value, collection);
    if (newSelectedKey !== selectedKey) {
      if (onSelectionChange) {
        onSelectionChange(newSelectedKey);
      }
    }

    lastSelectedKey.current = newSelectedKey;
  };

  let initialSelectedKeyText = collection.getItem(props.selectedKey)?.textValue;
  let initialDefaultSelectedKeyText = collection.getItem(props.defaultSelectedKey)?.textValue;
  let [inputValue, setInputValue] = useControlledState(toString(props.inputValue), initialSelectedKeyText || toString(props.defaultInputValue) || initialDefaultSelectedKeyText || '', onInputChange);

  let selectedKey = props.selectedKey || computeKeyFromValue(inputValue, collection);
  let selectedKeys = useMemo(() => selectedKey != null ? [selectedKey] : [], [selectedKey]);

  let triggerState = useMenuTriggerState(props);
  // Fires when user hits Enter or clicks
  let setSelectedKey = useCallback((key) => {
    let item = collection.getItem(key);
    let itemText = item ? item.textValue : '';
    // think about the below conditionals below
    // If I don't have the extra itemText check, then setting props.selectedKey to undef or just deleting one letter of the text
    // so it doesn't match a key will then clear the textfield entirely (in controlled selected key case)
    itemText && setInputValue(itemText);

    // If itemText happens to be the same as the current input text but the keys don't match
    // setInputValue won't call onSelectionChange for us so we call it here manually
    if (itemText === inputValue && selectedKey !== key) {
      if (onSelectionChange) {
        onSelectionChange(key);
      }
    }

    // Only close the menu if the key is being set to something and not to undefined? (this is so when user backspaces the menu stays open)
    // Or should this even be here? If we remove and put .close on Enter in useComboBox then we can
    // have consitent behavior of menu staying open when the user types in something matching a combobox option for controlled and uncontrolled
    // and still have Enter/Click close the menu
    // This question is mainly around the behavior of if the menu should close when the user
    // types something matching a option or if it should stay open
    // If we want to keep the behavior of closing the menu when the user types in a valid combobox value
    // then I think we'll have to add someting to onInputChange where it calls .close after onSelectionCHange (actually doesn't work cuz onChange in useCOmbobox makes it open again)
    // key && triggerState.setOpen(false);
  }, [collection, setInputValue, inputValue, onSelectionChange, selectedKey]);


  let lastSelectedKeyProp = useRef('' as Key);
  // Update the selectedKey and inputValue when props.selectedKey updates
  useEffect(() => {
    // need this check since setSelectedKey changes a lot making this useEffect fire even when props.selectedKey hasn't changed
    if (lastSelectedKeyProp.current !== props.selectedKey) {
      setSelectedKey(props.selectedKey);
    }
    lastSelectedKeyProp.current = props.selectedKey;
    // as asked about, should the the triggerstate.setOpen be put here?
    // props.selectedKey && triggerState.setOpen(false);
  }, [props.selectedKey, setSelectedKey]);

  // If props.inputValue changes, call onSelectionChange (it doesn't get called since onInputChange doesn't trigger on prop.inputValue changes)
  useEffect(() => {
    let newSelectedKey = computeKeyFromValue(props.inputValue, collection);
    // Only call onSelection if key changes (lastSelectedKey is also updated when user types so this stops duplicated onSelectionChange calls)
    if (newSelectedKey !== lastSelectedKey.current) {
      if (onSelectionChange) {
        onSelectionChange(newSelectedKey);
      }
    }

    lastSelectedKey.current = selectedKey;
  }, [props.inputValue, collection, selectedKey, onSelectionChange]);

  let selectionState = useMultipleSelectionState(
    {
      ...props,
      selectedKeys,
      disallowEmptySelection: true,
      onSelectionChange: (keys: Set<Key>) => setSelectedKey(keys.values().next().value),
      selectionMode: 'single'
    }
  );

  let disabledKeys = useMemo(() =>
    props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  , [props.disabledKeys]);

  let lowercaseValue = inputValue.toLowerCase().replace(' ', '');

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
    if (onFilter && lastValue.current !== inputValue) {
      onFilter(inputValue);
    }

    lastValue.current = inputValue;
  }, [inputValue, onFilter]);

  let filteredCollection = useMemo(() => {
    if (itemsControlled || inputValue === '') {
      return collection;
    }
    return new TreeCollection(filter(collection, defaultFilterFn), {expandedKeys: new Set()});
  }, [collection, inputValue, itemsControlled, defaultFilterFn]);

  let selectionManager = new SelectionManager(filteredCollection, selectionState);
  let selectedItem = selectedKey ? collection.getItem(selectedKey) : null;

  // Prevent open operations from triggering if there is nothing to display
  let open = (focusStrategy?) => {
    if (filteredCollection.size > 0) {
      triggerState.open(focusStrategy);
    }
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
    isOpen: triggerState.isOpen && isFocused && filteredCollection.size > 0,
    inputValue,
    setInputValue
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
