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
  inputRef
}

interface ComboBoxAria {
  triggerProps: HTMLAttributes<HTMLElement>,
  inputProps: HTMLAttributes<HTMLElement>,
  menuProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>
}

import {HTMLAttributes} from 'react';
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



  // Not sure if we use this. Can we just use `useListBoxLayout` from ListBoxBase?
    // Do we use this? Or do we use useSelectableList instead?
    // let {collectionProps} = useSelectableCollection({
    //   selectionManager: state.selectionManager,
    //   keyboardDelegate: layout // write own keyboard delegate? Unneeded if using useSelectableList
    // });

  // TextFieldBase already has useTextField and will return the value of onChange as a string instead
  // of an event, this leads to us getting onChange twice if we useTextField as well, and it'll throw an error
  // because string.target doesn't exist
  // would it be better to useTextField and discard usage of TextFieldBase?
  let {fieldProps, labelProps} = useLabel(props);
  let onChange = (val) => {
    if (props.menuTrigger === 'input' && val.length > 0) {
      state.setOpen(true);
    }
    state.setValue(val);
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
      'aria-autocomplete': 'list'
    },
    menuProps: {
      // ...collectionProps,
      ...menuProps,
    }
  };
}
