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
import {CollectionBuilder, Node, TreeCollection} from '@react-stately/collections';
import {Key, useEffect, useMemo, useRef, useState} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useMenuTriggerState} from '@react-stately/menu';

export interface ComboBoxState<T> extends SelectState<T> {
  inputValue: string,
  setInputValue: (value: string) => void
}

interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection {
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  inputValue?: string,
  defaultInputValue?: string,
  onInputChange?: (value: string) => void,
  onFilter?: (value: string) => void,
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
    collator
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

  let initialSelectedKeyText = collection.getItem(props.selectedKey)?.textValue;
  let initialDefaultSelectedKeyText = collection.getItem(props.defaultSelectedKey)?.textValue;
  let [inputValue, setInputValue] = useControlledState(toString(props.inputValue) || initialSelectedKeyText, toString(props.defaultInputValue) || initialDefaultSelectedKeyText || '', onInputChange);

  let selectedKey = computeKeyFromValue(inputValue, collection);
  let selectedKeys = useMemo(() => selectedKey != null ? [selectedKey] : [], [selectedKey]);

  let setSelectedKey = (key) => {
    if (key !== selectedKey) {
      let item = collection.getItem(key);
      let itemText = item ? item.textValue : '';
      setInputValue(itemText);
      triggerState.setOpen(false);
    }
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
    return new TreeCollection(filter(collection, defaultFilterFn), new Set());
  }, [collection, inputValue, itemsControlled, defaultFilterFn]);

  let selectionManager = new SelectionManager(filteredCollection, selectionState);

  // Focus first item if filtered collection no longer contains original focused item
  useEffect(() => {
    // Only set a focused key if one existed previously, don't want to focus something by default if customValue = true
    if (selectionManager.focusedKey && !filteredCollection.getItem(selectionManager.focusedKey)) {
      selectionManager.setFocusedKey(filteredCollection.getFirstKey());
    }
  }, [selectionManager, filteredCollection]);

  let selectedItem = selectedKey ? collection.getItem(selectedKey) : null;

  return {
    ...triggerState,
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
