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

import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

import {CollectionBase, SingleSelection} from '@react-types/shared';
import {useListState} from '@react-stately/list';
import {useMenuTriggerState} from '@react-stately/menu';

export interface ComboBoxState<T> {
  // collection: Collection<Node<T>>,
  // // disabledKeys: Set<Key>,   will combobox have disabled items in its list?
  // selectionManager: SelectionManager,
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  value: string,
  setValue: (value: string) => void
  // TODO add liststate types and menutrigger types here
}

interface ComboBoxProps extends CollectionBase<T>, SingleSelection {
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  inputValue?: string,
  defaultInputValue?: string,
  onInputChange?: (value: string) => void,
  onFilter?: (value: string) => void,
  allowsCustomValue?: boolean,
  onCustomValue?: (value: string) => void,
  completionMode?: 'suggest' | 'complete',
  menuTrigger?: 'focus' | 'input' | 'manual'
}

export function useComboBoxState<T>(props: ComboBoxProps<T>): ComboBoxState<T> {
  // listState (uncontrolled), gives us collection and selectionManager
  let listState = useListState({
    ...props,
    selectionMode: 'single'
  });


  // I think we don't need the builder and stuff cuz we can useListState?

  // let selectionState = useMultipleSelectionState({...props, selectionMode: 'single'});
  // let disabledKeys = useMemo(() =>
  //   props.disabledKeys ? new Set(props.disabledKeys) : new Set<Key>()
  // , [props.disabledKeys]);
  // let builder = useMemo(() => new CollectionBuilder<T>(props.itemKey), [props.itemKey]);
  // let collection = useMemo(() => {
  //   let nodes = builder.build(props, (key) => ({
  //     isSelected: selectionState.selectedKeys.has(key),
  //     // isDisabled: disabledKeys.has(key),
  //     isFocused: key === selectionState.focusedKey
  //   }));

  //   return new TreeCollection(nodes);
  // }, [builder, props, selectionState.selectedKeys, selectionState.focusedKey]);



  // I think we don't need the below since we have useMenuTriggerState

  // // openState (controlled), gives us ability to open/close menu
  // let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen, props.onOpenChange);

  let menuState = useMenuTriggerState(props);


  let [value, setValue] = useControlledState(toString(props.inputValue), toString(props.defaultInputValue) || '', props.onInputChange);


  // For completionMode = complete
  let [suggestionValue, setSuggestionValue] = useState('');



  // selectedItemState (aria-activedecendent), maybe just need to modify useSelectableItem or something


  return {
    // collection,
    // // disabledKeys,
    // selectionManager: new SelectionManager(collection, selectionState),
    ...listState,
    ...menuState,
    // isOpen,
    // setOpen,
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
