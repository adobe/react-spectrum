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

import {AriaButtonProps} from '@react-types/button';
import {chain} from '@react-aria/utils';
import {ComboBoxProps} from '@react-types/combobox';
import {ComboBoxState} from '@react-stately/combobox';
import {getItemId, listIds} from '@react-aria/listbox';
import {HTMLAttributes, RefObject, useEffect, useRef} from 'react';
import {ListLayout} from '@react-stately/layout';
import {useMenuTrigger} from '@react-aria/menu';
import {useSelectableCollection} from '@react-aria/selection';
import {useTextField} from '@react-aria/textfield';

interface AriaComboBoxProps<T> extends ComboBoxProps<T> {
  popoverRef: RefObject<HTMLDivElement>,
  triggerRef: RefObject<HTMLElement>,
  inputRef: RefObject<HTMLInputElement>,
  layout: ListLayout<T>
}

interface ComboBoxAria {
  triggerProps: AriaButtonProps,
  inputProps: HTMLAttributes<HTMLElement>,
  listBoxProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>
}

export function useComboBox<T>(props: AriaComboBoxProps<T>, state: ComboBoxState<T>): ComboBoxAria {
  let {
    triggerRef,
    popoverRef,
    inputRef,
    layout,
    completionMode = 'suggest',
    menuTrigger = 'input',
    allowsCustomValue,
    onCustomValue
  } = props;

  let {menuTriggerProps, menuProps} = useMenuTrigger(
    {
      type: 'listbox'
    },
    state,
    triggerRef
  );

  let onChange = (val) => {
    state.setInputValue(val);

    if (menuTrigger !== 'manual') {
      state.open();
    }
  };

  // Had to set the list id here instead of in useListBox or ListBoxBase so that it would be properly defined
  // when getting focusedKeyId
  listIds.set(state, menuProps.id);

  let focusedItem = state.selectionManager.focusedKey && state.isOpen ? state.collection.getItem(state.selectionManager.focusedKey) : undefined;
  let focusedKeyId = focusedItem ? getItemId(state, focusedItem.key) : undefined;

  // Using layout initiated from ComboBox, generate the keydown handlers for textfield (arrow up/down to navigate through menu when focus in the textfield)
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: layout,
    disallowTypeAhead: true,
    disallowEmptySelection: true,
    disallowSelectAll: true,
    ref: inputRef
  });

  // For textfield specific keydown operations
  let onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        if (focusedItem) {
          state.setSelectedKey(state.selectionManager.focusedKey);
          // I think I need this .close so that the menu closes even
          // when the user hits Enter on the already selectedKey
          state.close();
        }
        break;
      case 'Escape':
        state.close();
        break;
      case 'ArrowDown':
        state.open('first');
        break;
      case 'ArrowUp':
        state.open('last');
        break;
    }
  };

  let onBlur = (e) => {
    // If user is clicking on the combobox button, early return so we don't change textfield focus state, update the selected key erroneously,
    // and trigger close menu twice
    if (triggerRef.current && triggerRef.current.contains(e.relatedTarget)) {
      return;
    }

    state.close();

    // If blur happens from clicking on menu item, refocus textfield and early return
    if (popoverRef.current && popoverRef.current.contains(e.relatedTarget)) {
      // Stop propagation so focus styles on button don't go away
      e.stopPropagation();
      inputRef.current.focus();
      return;
    }

    if (props.onBlur) {
      props.onBlur(e);
    }

    state.setFocused(false);

    if (focusedItem) {
      state.setSelectedKey(state.selectionManager.focusedKey);
    } else if (allowsCustomValue && !state.selectedKey && onCustomValue) {
      onCustomValue(state.inputValue);
    } else if (!allowsCustomValue) {
      // Clear the input field in the case of menuTrigger = manual and the user has typed
      // in a value that doesn't match any of the list items
      let item = state.collection.getItem(state.selectedKey);
      let itemText = item ? item.textValue : '';
      state.setInputValue(itemText);
    }
  };

  let onFocus = (e) => {
    // If inputfield is already focused, early return to prevent extra props.onFocus calls
    if (state.isFocused) {
      return;
    }

    if (menuTrigger === 'focus') {
      state.open();
    }

    if (props.onFocus) {
      props.onFocus(e);
    }

    state.setFocused(true);
  };

  let {labelProps, inputProps} = useTextField({
    ...props,
    onChange,
    onKeyDown: chain(state.isOpen && collectionProps.onKeyDownCapture, onKeyDown),
    onBlur,
    value: state.inputValue,
    onFocus
  }, inputRef);

  // Return focus to textfield if user clicks menu trigger button
  let onPress = (e) => {
    if (e.pointerType === 'touch') {
      inputRef.current.focus();
      state.open();
    }
  };

  let onPressStart = (e) => {
    if (e.pointerType !== 'touch') {
      inputRef.current.focus();
      state.open(e.pointerType === 'keyboard' || e.pointerType === 'virtual' ? 'first' : null);
    }
  };

  // TODO: Think about if the below focus key stuff needs to account for mobile
  // Focus first item if filtered collection no longer contains original focused item (aka user typing to filter collection)
  useEffect(() => {
    // Only set a focused key if one existed previously, don't want to focus something by default if allowsCustomValue = true
    if ((!allowsCustomValue || state.selectionManager.focusedKey) && state.inputValue !== '' && !state.collection.getItem(state.selectionManager.focusedKey)) {
      state.selectionManager.setFocusedKey(layout.getFirstKey());
    }
  }, [state.selectionManager, state.collection, layout, allowsCustomValue, state.inputValue]);

  // Clear focused key if user clears textfield to prevent accidental selection on blur
  // Also clear focused key if allowsCustomValue is true, there isn't a selected key, and there isn't a focusStrategy set (indicative of menu being opened via arrow up/down)
  // Specifically for case where menu is closed and user copy pastes a matching value into input field then deletes a character
  let lastValue = useRef(state.inputValue);
  useEffect(() => {
    if ((state.inputValue === '' && lastValue.current !== state.inputValue) || (allowsCustomValue && !state.selectedKey && !state.focusStrategy)) {
      state.selectionManager.setFocusedKey(null);
    }

    lastValue.current = state.inputValue;
  }, [state.selectionManager, state.inputValue]);

  return {
    labelProps,
    triggerProps: {
      ...menuTriggerProps,
      excludeFromTabOrder: true,
      onPress,
      onPressStart
    },
    inputProps: {
      ...inputProps,
      role: 'combobox',
      'aria-controls': state.isOpen ? menuProps.id : undefined,
      'aria-autocomplete': completionMode === 'suggest' ? 'list' : 'both',
      'aria-activedescendant': focusedKeyId
    },
    listBoxProps: {
      ...menuProps
    }
  };
}
