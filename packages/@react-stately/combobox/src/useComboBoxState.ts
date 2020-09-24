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

import {ComboBoxProps} from '@react-types/combobox';
import {Key, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Node} from '@react-types/shared';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useMenuTriggerState} from '@react-stately/menu';
import {useSingleSelectListState} from '@react-stately/list';

export interface ComboBoxState<T> extends SelectState<T> {
  inputValue: string,
  setInputValue: (value: string) => void
}

interface ComboBoxStateProps<T> extends ComboBoxProps<T> {
  collator: Intl.Collator,
  isMobile?: boolean
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
    onSelectionChange,
    isMobile
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

  // Need this collection here so that an initial inputValue can be found via collection.getItem
  // This is really just a replacement for using CollectionBuilder
  let {collection, disabledKeys} = useSingleSelectListState({
    ...props,
    // default to null if props.selectedKey isn't set to avoid useControlledState's uncontrolled to controlled warning
    selectedKey: props.selectedKey || null
  });

  if (props.selectedKey && props.inputValue && !disabledKeys.has(props.selectedKey)) {
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
      if (onSelectionChange && !disabledKeys.has(newSelectedKey)) {
        onSelectionChange(newSelectedKey);
      }
    }
  };

  let initialSelectedKeyText = disabledKeys.has(props.selectedKey) ? '' : collection.getItem(props.selectedKey)?.textValue;
  let initialDefaultSelectedKeyText = disabledKeys.has(props.defaultSelectedKey) ? '' : collection.getItem(props.defaultSelectedKey)?.textValue;
  let [inputValue, setInputValue] = useControlledState(toString(props.inputValue), initialSelectedKeyText || toString(props.defaultInputValue) || initialDefaultSelectedKeyText || '', onInputChange);

  // If user passes props.selectedKey=null or '', we want to honor that as the new key (e.g. Controlled key combobox, user want to programatically clear the selected key regardless of current input value)
  let selectedKey = typeof props.selectedKey !== 'undefined' ? props.selectedKey : computeKeyFromValue(inputValue, collection);

  // Wipe selectedKey if is in the disabled key list since it is an invalid selection
  if (disabledKeys.has(selectedKey)) {
    selectedKey = undefined;
  }

  let triggerState = useMenuTriggerState(props);

  // Fires on selection change (when user hits Enter, clicks list item, props.selectedKey is changed)
  let setSelectedKey = useCallback((key) => {
    if (!disabledKeys.has(key)) {
      let item = collection.getItem(key);
      let itemText = item ? item.textValue : '';

      // Update input value except in the case where itemText is empty and the user is in the input field (indicative of a controlled key case and the user hit backspace on a currently valid item)
      if (itemText || !isFocused) {
        setInputValue(itemText);
      }

      // If itemText happens to be the same as the current input text but the keys don't match
      // setInputValue won't call onSelectionChange for us so we call it here manually
      if (itemText === inputValue && selectedKey !== key) {
        if (onSelectionChange) {
          onSelectionChange(key);
        }
      }
    }
  }, [collection, setInputValue, inputValue, onSelectionChange, selectedKey, isFocused, disabledKeys]);

  // Update the selectedKey and inputValue when props.selectedKey updates
  let lastSelectedKeyProp = useRef(props.selectedKey);
  useEffect(() => {
    // need this check since setSelectedKey changes a lot making this useEffect fire even when props.selectedKey hasn't changed
    if (lastSelectedKeyProp.current !== props.selectedKey) {
      setSelectedKey(props.selectedKey);
    }
    lastSelectedKeyProp.current = props.selectedKey;
  }, [props.selectedKey, setSelectedKey]);

  let lowercaseValue = inputValue.toLowerCase().replace(/ /g, '');
  let defaultFilterFn = useMemo(() => (node: Node<T>) => {
    let scan = 0;

    let lowercaseNode = node.textValue.toLowerCase().replace(/ /g, '');
    let sliceLen = lowercaseValue.length;
    let match = false;

    if (lowercaseValue.length > 0) {
      for (; scan + sliceLen <= lowercaseNode.length && !match; scan++) {
        let nodeSlice = lowercaseNode.slice(scan, scan + sliceLen);
        let compareVal = collator.compare(lowercaseValue, nodeSlice);
        if (compareVal === 0) {
          match = true;
        }
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

  let nodeFilter = useMemo(() => {
    if (itemsControlled || inputValue === '') {
      return null;
    }
    return (nodes) => filter(nodes, defaultFilterFn);
  }, [itemsControlled, inputValue, defaultFilterFn]);

  let {collection: filteredCollection, selectionManager, selectedItem} = useSingleSelectListState(
    {
      ...props,
      // Fall back to null as the selectedKey to avoid useControlledState error of uncontrolled to controlled and viceversa
      selectedKey: selectedKey || null,
      onSelectionChange: (key: Key) => {
        setSelectedKey(key);
        triggerState.close();
      },
      filter: nodeFilter
    }
  );

  // Prevent open operations from triggering if there is nothing to display, exception is for mobile so that user can access tray input since textfield is read only
  let open = (focusStrategy?) => {
    if (isMobile || filteredCollection.size > 0) {
      triggerState.open(focusStrategy);
    }
  };

  // For mobile view comboboxes, the tray should remain open/can be opened even if user changes input such that the filteredCollection doesn't contain any matching items
  let isOpen = triggerState.isOpen && isFocused && (isMobile || filteredCollection.size > 0);

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
    isOpen,
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
