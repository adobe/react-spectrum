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

 // TODO flesh out these types
interface ComboBoxProps {
  triggerRef,
  inputRef,
  layout: any
}

interface ComboBoxAria {
  triggerProps: HTMLAttributes<HTMLElement>,
  inputProps: HTMLAttributes<HTMLElement>,
  menuProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>
}

import {HTMLAttributes, useEffect, useState} from 'react';
import {chain, useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useMenuTrigger} from '@react-aria/menu';
import {useSelectableCollection} from '@react-aria/selection';
import {useTextField} from '@react-aria/textfield';
import {ComboBoxState} from '@react-stately/combobox';

let count = 0;
export function useComboBox<T>(props: ComboBoxProps, state: ComboBoxState<T>): ComboBoxAria {
  // double check that user provided id gets sent to textfield and not to wrapper div


  // onFocus, calls state.open, attaches itself to textfield
  // onChange
  // onInputChange

  // onKeyPress for tab to complete suggestion, handle later


  // // Might not need this if we have useTextfield since useTextField calls useLabel? Depends on wrapper I guess
  // let {labelProps, fieldProps} = useLabel({
  //   id: inputId, // Maybe wrapper id?,
  //   ...props
  // });

  // I think we'll need this, probably won't use MenuTrigger component since behavior isn't as straight forward
  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: props.triggerRef //ref of the trigger button, maybe not props.ref
    },
    state
  );


  // TextFieldBase already has useTextField and will return the value of onChange as a string instead
  // of an event, this leads to us getting onChange twice if we useTextField as well, and it'll throw an error
  // because string.target doesn't exist
  // would it be better to useTextField and discard usage of TextFieldBase?
  let {fieldProps, labelProps} = useLabel(props);
  let onChange = (val) => {
    if (props.menuTrigger === 'input' && val.length > 0) {
      state.open();
    }
    state.setValue(val);
  };



  // Belongs in useComboBox or move back to comboBox?
  useEffect(() => {
    // Logic for what should be rendered in the TextField when state.selectedKey is changed/defined
    // Perhaps include inputValue here as well? Maybe this is where all the logic for determining state.value should go
    // Think about where to put this and if there is a better way to do this

    // Pull selectedItem out of the useEffect?
    let selectedItem = state.selectedKey ? state.collection.getItem(state.selectedKey) : null;
    if (selectedItem) {
      let itemText = selectedItem.textValue || selectedItem.rendered;

      // TODO: logic on whether or not to take the selectedItem value over the current value (check if controlled or not)
      // TODO: all other logic


      // Throw error if controlled inputValue and controlled selectedKey don't match
      if (props.inputValue && props.selectedKey && (props.inputValue !== itemText)) {
        throw new Error('Mismatch between selected item and inputValue!')
      }

      // Update textfield value if new item is selected
      if (itemText !== state.value) {
        state.setValue(itemText);
      }
    }
  }, [state.selectedKey])


  // Refine the below, feels weird to have focusedItem and also need to still do state.selectionManger.focusedKey
  // Belongs in useComboBox?
  let [focusedKeyId, setFocusedKeyId] = useState(null);
  let focusedItem = state.selectionManager.focusedKey ? state.collection.getItem(state.selectionManager.focusedKey) : null;
  useEffect(() => {
    if (focusedItem) {
      setFocusedKeyId(`${menuProps.id}-option-${focusedItem.key}`);
    }
  }, [focusedItem])


  // Using layout initiated from ComboBox, generate the keydown handlers for textfield (arrow up/down to navigate through menu when focus in the textfield)
  // Do this or just write own onKeyDown since we don't need all of them?
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: props.layout
  });


  // For textfield specific keydown operations
  let onKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        // This probably shouldn't be a if statement on focusedItem only since hitting Enter should prob submit the
        // current input as well if menu isn't opened but that will be implemented later
        if (state.isOpen && focusedItem) {
          state.setSelectedKey(state.selectionManager.focusedKey);
          state.setOpen(false);
        }

        break;
      case "Escape":
        state.setOpen(false);
        break;
    }
  };


// Talk to MJ or James about whether the input aria stuff goes on the input or on the wrapper
// aria-controls vs aria-owns vs having both
// what v2 stuff we should take, should look at v2?
// Support listbox only? Or support grid/dialog/etc for popup/menu
    // grid -> gridview/tableview instead of listbox, like a 2d list, look at aria spec
    // dialog ->


  return {
    labelProps,
    triggerProps: {
      // make sure this has controls -> listbox menu
      // should have aria-haspopup -> listbox menu
      ...menuTriggerProps,
      tabIndex: -1
    },
    inputProps: {
      ...fieldProps,
      // make sure this doesn't have aria-owns
      // should have aria-haspopup -> listbox menu
      onChange,
      role: 'combobox',
      'aria-controls': state.isOpen ? menuProps.id : undefined,
      'aria-autocomplete': 'list',
      'aria-activedescendant': state.isOpen ? focusedKeyId : undefined,
      onKeyDown:  chain(collectionProps.onKeyDown, onKeyDown)
    },
    menuProps: {
      // ...collectionProps,
      ...menuProps,
    }
  };
}
