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

 // TODO: flesh out these types
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
import {chain, mergeProps} from '@react-aria/utils';
import {useLabel} from '@react-aria/label';
import {useMenuTrigger} from '@react-aria/menu';
import {useSelectableCollection} from '@react-aria/selection';
import {ComboBoxState} from '@react-stately/combobox';

export function useComboBox<T>(props: ComboBoxProps, state: ComboBoxState<T>): ComboBoxAria {
  // TODO: destructure props

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      ref: props.triggerRef
    },
    state
  );

  // TextFieldBase already has useTextField and will return the value of onChange as a string instead
  // of an event, this leads to us getting onChange twice if we useTextField as well, and it'll throw an error
  // because string.target doesn't exist
  let {fieldProps, labelProps} = useLabel(props);
  let onChange = (val) => {
    if (props.menuTrigger === 'input' && val.length > 0) {
      state.open(); // is this right? at this time, we haven't filtered, so we don't know if the character they type will result in an empty menu
    }
    state.setValue(val);
  };

  // TODO: double check if selectedItem should be moved into the useEffect
  // If not change the dependency array to be on selectedItem
  let selectedItem = state.selectedKey ? state.collection.getItem(state.selectedKey) : null;
  useEffect(() => {
    if (selectedItem) {
      let itemText = selectedItem.textValue || selectedItem.rendered;

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


  // TODO: Refine the below, feels weird to have focusedItem and also need to still do state.selectionManger.focusedKey
  let [focusedKeyId, setFocusedKeyId] = useState(null);
  let focusedItem = state.selectionManager.focusedKey ? state.collection.getItem(state.selectionManager.focusedKey) : null;
  useEffect(() => {
    if (focusedItem) {
      setFocusedKeyId(`${menuProps.id}-option-${focusedItem.key}`);
    }
  }, [focusedItem])


  // Using layout initiated from ComboBox, generate the keydown handlers for textfield (arrow up/down to navigate through menu when focus in the textfield)
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: props.layout,
    shouldTypeAhead: false
  });

  let onBlur = (e) => {
    if (props.onBlur) {
      props.onBlur(e);
    }

    // TODO: Double check if this is needed, from v2
    if (props.popoverRef.current && props.popoverRef.current.contains(document.activeElement)) {
      // If the element receiving focus is the Popover (dropdown menu),
      // (i.e. user clicking dropdown scroll bar in IE 11),
      // refocus the input field and return so the menu isn't hidden.
      event.target.focus();
      return;
    }

    if (state.isOpen && focusedItem) {
      state.setSelectedKey(state.selectionManager.focusedKey);
    }

    // A bit strange behavior when isOpen is true, menu can't close so you can't tab away from the
    // textfield, almost like a focus trap
    state.close();
  }

  // For textfield specific keydown operations
  let onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        if (state.isOpen && focusedItem) {
          state.setSelectedKey(state.selectionManager.focusedKey);
          state.setOpen(false);
        }

        break;
      case 'Escape':
        state.setOpen(false);
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        if (state.isOpen && !focusedItem) {
          let firstKey = state.collection.firstKey;
          state.selectionManager.setFocusedKey(firstKey);
        }
        break;
    }
  };

  // Return focus to textfield if user clicks menu trigger button
  let onPress = (e) => {
    if (e.pointerType === 'touch') {
      props.inputRef.current.focus();
    }
  };

  let onPressStart = (e) => {
    if (e.pointerType !== 'touch') {
      props.inputRef.current.focus();
    }
  };

  return {
    labelProps,
    triggerProps: {
      // TODO: make sure this has controls -> listbox menu
      // TODO: should have aria-haspopup -> listbox menu
      ...mergeProps({onPressStart, onPress}, menuTriggerProps),
      // Add an onclick here that focuses the textfield
      tabIndex: -1
    },
    inputProps: {
      // TODO: double check that user provided id gets sent to textfield and not to wrapper div
      ...fieldProps,
      // TODO: make sure this doesn't have aria-owns
      // TODO: should have aria-haspopup -> listbox menu
      onChange,
      role: 'combobox',
      'aria-controls': state.isOpen ? menuProps.id : undefined,
      'aria-autocomplete': props.completionMode === 'suggest' ? 'list' : 'both',
      'aria-activedescendant': state.isOpen ? focusedKeyId : undefined,
      onKeyDown: chain(collectionProps.onKeyDown, onKeyDown),
      onBlur
    },
    menuProps
  };
}
