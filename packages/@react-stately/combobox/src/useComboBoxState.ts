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
import {Key, useEffect, useMemo, useRef, useState} from 'react';
import {ListCollection, useSingleSelectListState} from '@react-stately/list';
import {SelectState} from '@react-stately/select';
import {useControlledState} from '@react-stately/utils';
import {useMenuTriggerState} from '@react-stately/menu';

export interface ComboBoxState<T> extends SelectState<T> {
  inputValue: string,
  setInputValue(value: string): void,
  commit(): void
}

type FilterFn = (textValue: string, inputValue: string) => boolean;
interface ComboBoxStateProps<T> extends ComboBoxProps<T> {
  defaultFilter?: FilterFn,
  allowsEmptyCollection?: boolean,
  shouldCloseOnBlur?: boolean
}

export function useComboBoxState<T extends object>(props: ComboBoxStateProps<T>): ComboBoxState<T> {
  let {
    defaultFilter,
    menuTrigger = 'input',
    allowsEmptyCollection = false,
    allowsCustomValue,
    shouldCloseOnBlur = true
  } = props;

  let [isFocused, setFocusedState] = useState(false);
  let [inputValue, setInputValueState] = useControlledState(
    props.inputValue,
    props.defaultInputValue ?? '',
    props.onInputChange
  );

  let {collection, selectionManager, selectedKey, setSelectedKey, selectedItem, disabledKeys} = useSingleSelectListState(
    {
      ...props,
      items: props.items ?? props.defaultItems,
      onSelectionChange: (key: Key) => {
        props.onSelectionChange?.(key);
        if (key != null) {
          triggerState.close();
        }
      }
    }
  );

  let filteredCollection = useMemo(() => (
    // No default filter if items are controlled.
    props.items != null || !defaultFilter
      ? collection
      : filterCollection(collection, inputValue, defaultFilter)
  ), [collection, inputValue, defaultFilter, props.items]);

  let setInputValue = (value: string) => {
    setInputValueState(value);
    selectionManager.setFocusedKey(null);
    if (value === '') {
      setSelectedKey(null);
    }
  };

  let triggerState = useMenuTriggerState(props);
  let open = (focusStrategy?: FocusStrategy) => {
    // Prevent open operations from triggering if there is nothing to display
    if (allowsEmptyCollection || filteredCollection.size > 0) {
      triggerState.open(focusStrategy);
    }
  };

  let lastValue = useRef(inputValue);
  let resetInputValue = () => {
    let itemText = collection.getItem(selectedKey)?.textValue ?? '';
    lastValue.current = itemText;
    setInputValueState(itemText);
  };

  useEffect(() => {
    // Do nothing if the open state is controlled.
    if (props.isOpen != null) {
      return;
    }

    // Open the menu if focused, there are items in the collection, and the input value changed.
    if (
      isFocused &&
      filteredCollection.size > 0 &&
      !triggerState.isOpen &&
      inputValue !== lastValue.current &&
      menuTrigger !== 'manual'
    ) {
      open();
    }

    // Close the menu if the collection is empty.
    if (!allowsEmptyCollection && triggerState.isOpen && filteredCollection.size === 0) {
      triggerState.close();
    }

    lastValue.current = inputValue;
  });

  let isInitialRender = useRef(true);
  let lastSelectedKey = useRef(null);
  useEffect(() => {
    // Do nothing if both inputValue and selectedKey are controlled.
    // In this case, it's the user's responsibility to update inputValue in onSelectionChange.
    if (props.inputValue != null && props.selectedKey != null) {
      return;
    }

    // Update input value to the text of the selected item when the selectedKey changes,
    // except when this is the initial render and there is a defaultInputValue.
    if (selectedKey !== lastSelectedKey.current && !(isInitialRender.current && props.defaultInputValue != null)) {
      resetInputValue();
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
    if (!allowsCustomValue) {
      resetInputValue();
    } else {
      lastSelectedKey.current = null;
      setSelectedKey(null);
    }
  };

  let commit = () => {
    if (triggerState.isOpen && selectionManager.focusedKey != null) {
      setSelectedKey(selectionManager.focusedKey);
    } else {
      commitCustomValue();
    }

    triggerState.close();
  };

  let setFocused = (isFocused: boolean) => {
    if (isFocused) {
      if (menuTrigger === 'focus') {
        open();
      }
    } else if (shouldCloseOnBlur) {
      commitCustomValue();
      triggerState.close();
    }

    setFocusedState(isFocused);
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
    inputValue,
    setInputValue,
    commit
  };
}


export function filterCollection<T extends object>(collection: Collection<Node<T>>, inputValue: string, filter: FilterFn): Collection<Node<T>> {
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
