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

import {chain} from '@react-aria/utils';
import {ComboBoxProps} from '@react-types/combobox';
import {ComboBoxState} from '@react-stately/combobox';
import {FocusEvent, HTMLAttributes, RefObject, useEffect} from 'react';
import {getItemId, listIds} from '@react-aria/listbox';
import {ListLayout} from '@react-stately/collections';
import {PressProps} from '@react-aria/interactions';
import {useMenuTrigger} from '@react-aria/menu';
import {useSelectableCollection} from '@react-aria/selection';
import {useTextField} from '@react-aria/textfield';

interface AriaComboBoxProps<T> extends ComboBoxProps<T> {
  popoverRef: RefObject<HTMLDivElement>,
  triggerRef: RefObject<HTMLElement>,
  inputRef: RefObject<HTMLInputElement>,
  layout: ListLayout<T>,
  onBlur?: (e: FocusEvent<Element>) => void, // don't think these two (blur/focus) should be added?
  onFocus?: (e: FocusEvent<Element>) => void
}

interface ComboBoxAria {
  triggerProps: HTMLAttributes<HTMLElement> & PressProps,
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
      ref: triggerRef,
      type: 'listbox'
    },
    state
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
    shouldTypeAhead: false,
    disallowEmptySelection: true,
    disallowSelectAll: true
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
    onKeyDown: chain(collectionProps.onKeyDown, onKeyDown),
    onBlur,
    value: state.inputValue,
    onFocus
  }, inputRef);

  // Return focus to textfield if user clicks menu trigger button
  let onPress = (e) => {
    if (e.pointerType === 'touch') {
      inputRef.current.focus();
      !state.isOpen && state.close();
    }
  };

  let onPressStart = (e) => {
    if (e.pointerType !== 'touch') {
      inputRef.current.focus();
      !state.isOpen && state.open(e.pointerType === 'keyboard' || e.pointerType === 'virtual' ? 'first' : null);
    }
  };

  // Focus first item if filtered collection no longer contains original focused item
  useEffect(() => {
    // Only set a focused key if one existed previously, don't want to focus something by default if customValue = true
    if (state.selectionManager.focusedKey && !state.collection.getItem(state.selectionManager.focusedKey)) {
      state.selectionManager.setFocusedKey(layout.getFirstKey());
    }
  }, [state.selectionManager, state.collection, layout]);

  return {
    labelProps,
    triggerProps: {
      ...menuTriggerProps,
      tabIndex: -1,
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
