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

  let [inputValue, setInputValue] = useControlledState(toString(props.inputValue), toString(props.defaultInputValue) || '', onInputChange);
  let selectedKeyText = selectState.selectedItem ? selectState.selectedItem.textValue : undefined;

  // rename to inputValue?
  let value = inputValue || selectedKeyText || '';







  // Attempt to put it all within a single use effect
  // I think I'm going about this all wrong

  let lastInputValue = useRef(inputValue);
  let lastSelectedKey = useRef(selectState.selectedKey);
  useEffect(() => {
    // If selectedKey exists but inputValue doesn't equal the selectedKeyText
    // clear selection (e.g. user backspaces in input field)
    // Maybe should be value?
    if (lastInputValue.current !== inputValue && selectState.selectedKey && inputValue !== selectedKeyText) {
      selectState.selectionManager.clearSelection();
      lastInputValue.current = inputValue;
      lastSelectedKey.current = undefined;
    } else if (lastSelectedKey.current !== selectState.selectedKey) {
      // If user selects a item or the selectedKey is updated via prop, update the field's
      // text to match the selectedKey and close the menu
      if (selectedKeyText) {
        setInputValue(selectedKeyText);
        lastInputValue.current = selectedKeyText
      }
     
      lastSelectedKey.current = selectState.selectedKey;
      // TODO change menuIsOpen and setMenuIsOpen to new way after Rob does the open state updates
      if (menuIsOpen) {
        setMenuIsOpen(false);
      }
    } else {
      // error if the values are out of sync
      if (inputValue && selectState.selectedKey && (inputValue !== selectedKeyText)) {
        // console.log('inputValue and selectedKey text',  inputValue, selectState.selectedKey, inputValue, selectedKeyText);
        throw new Error('Mismatch between selected item and inputValue!');
      }
    }
  }, [inputValue, selectedKeyText, menuIsOpen, setMenuIsOpen, selectState.selectedKey])



//  // Double check this one, do we need this if we clearSelection on change?
//   useEffect(() => {
//     if (selectState.selectedKey && inputValue !== selectedKeyText) {
//       selectState.selectionManager.clearSelection();
//     }
//   }, [inputValue])


  // If selectedKey changes, attempt to update inputValue as well?
  // If selectedKey is changed and menu is open, close the menu
  // Need to do a lastKey ref check kinda like onFilter does?
  // useEffect(() => {
  //   selectedKeyText && setInputValue(selectedKeyText);
    
  //   // TODO change menuIsOpen and setMenuIsOpen to new way after Rob does the open state updates
  //   if (menuIsOpen) {
  //     setMenuIsOpen(false);
  //   }
  // }, [selectState.selectedKey])

 
  // // Put in useEffect? comment out for now
  // useEffect(() => {
  //   if (inputValue && selectState.selectedKey && (inputValue !== selectedKeyText)) {
  //     console.log('inputValue and selectedKey text',  inputValue, selectState.selectedKey, inputValue, selectedKeyText);
  //     // throw new Error('Mismatch between selected item and inputValue!');
  //   }
  // }, [inputValue, selectState.selectedKey])

  


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

  return {
    ...selectState,
    open,
    close,
    toggle,
    value,
    setValue: setInputValue
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
