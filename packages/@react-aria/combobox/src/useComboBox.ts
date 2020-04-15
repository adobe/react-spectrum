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

interface ComboBoxProps {
  label: string,
  buttonRef,
  textFieldRef
}

interface ComboBoxAria {
}

import {useId} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useMenuTrigger} from '@react-aria/menu';
import {useSelectableCollection} from '@react-aria/selection';
import {useTextField} from '@react-aria/textfield';
import {ComboBoxState} from '@react-stately/combobox';

export function useComboBox(props: ComboBoxProps, state: ComboBoxState): ComboBoxAria {
  let menuId = useId();
  let inputId = useId();
  // let buttonId = useId(); 
  let labelId = useId();


  // onFocus
  // onChange
  // onInputChange

  // onKeyPress for tab to complete suggestion


  // Might not need this if we have useTextfield since useTextField calls useLabel? Depends on wrapper I guess
  let {labelProps, fieldProps} = useLabel({
    id: inputId, // Maybe wrapper id?,
    ...props
  });

  // I think we'll need this, probably won't use MenuTrigger component since behavior isn't as straight forward
  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: props.buttonRef //ref of the trigger button, maybe not props.ref
    },
    state
  );


  // Do we use this? Or do we use useSelectableList instead?
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout // write own keyboard delegate? Unneeded if using useSelectableList
  });

  // excluding labelProps since we'll be doing something custom
  let {textFieldProps} = useTextField(props, props.textFieldRef);


// Talk to MJ or James about whether the input aria stuff goes on the input or on the wrapper
// aria-controls vs aria-owns vs having both
// what v2 stuff we should take, should look at v2?
// Support listbox only? Or support grid/dialog/etc for popup/menu


  return {
    buttonAria: {
      ...menuTriggerProps,
      tabIndex: '-1'
    },
    inputAria: {
      ...textFieldProps,
      role: 'combobox',
      'aria-controls': menuId,
      'aria-autocomplete': 'list',
      'aria-labelledby': props.label && labelId,
      'aria-label': !props.label && props['aria-label']
    },
    menuAria: {
      ...collectionProps,
      ...menuProps,
      'aria-labelledby':inputId
    }
  };
}
