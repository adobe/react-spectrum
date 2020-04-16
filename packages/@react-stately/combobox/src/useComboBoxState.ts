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
import {useControlledState} from '@react-stately/utils';
import {useSelectState} from '@react-stately/select';
import {useState} from 'react';


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

interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection {
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
  let itemsControlled = !!props.onFilter;
  let menuControlled = props.isOpen !== undefined;
  let valueControlled = props.inputValue !== undefined;
  let selectedControlled = !!props.selectedKey;

  // listState (uncontrolled), gives us collection and selectionManager
  let selectState  = useSelectState(props);
  //  let areThereItems = listState.collection.size > 0;

  let [value, setValue] = useControlledState(toString(props.inputValue), toString(props.defaultInputValue) || '', props.onInputChange);

  // For completionMode = complete
  let [suggestionValue, setSuggestionValue] = useState('');

  // selectedItemState (aria-activedecendent), maybe just need to modify useSelectableItem or something


  return {
    ...selectState,
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
