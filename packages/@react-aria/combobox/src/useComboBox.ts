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
import {chain, mergeProps, useLabels} from '@react-aria/utils';
import {ComboBoxProps} from '@react-types/combobox';
import {ComboBoxState} from '@react-stately/combobox';
import {getItemId, listIds} from '@react-aria/listbox';
import {HTMLAttributes, InputHTMLAttributes, RefObject, useEffect, useRef} from 'react';
import {ListLayout} from '@react-stately/layout';
import {useMenuTrigger} from '@react-aria/menu';
import {usePress} from '@react-aria/interactions';
import {useSelectableCollection} from '@react-aria/selection';
import {useTextField} from '@react-aria/textfield';

export interface AriaComboBoxProps<T> extends ComboBoxProps<T> {
  popoverRef: RefObject<HTMLDivElement>,
  triggerRef: RefObject<HTMLElement>,
  inputRef: RefObject<HTMLInputElement & HTMLTextAreaElement>,
  layout: ListLayout<T>,
  isMobile?: boolean,
  menuId?: string
}

interface ComboBoxAria {
  triggerProps: AriaButtonProps,
  inputProps: InputHTMLAttributes<HTMLInputElement>,
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
    onCustomValue,
    isReadOnly,
    isDisabled,
    isMobile,
    shouldSelectOnBlur = true,
    menuId
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
    state.selectionManager.setFocusedKey(null);

    if (menuTrigger !== 'manual') {
      state.open();
    }
  };

  // TODO: perhaps I should alter useMenuTrigger/useOverlayTrigger to accept a user specified menuId
  // Had to set the list id here instead of in useListBox or ListBoxBase so that it would be properly defined
  // when getting focusedKeyId
  listIds.set(state, menuId || menuProps.id);

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
        } else if (allowsCustomValue) {
          onCustomValue(state.inputValue);
          state.close();
        }

        break;
      case 'Escape':
        if (state.isOpen) {
          state.close();
        }
        break;
      case 'ArrowDown':
        state.open('first');
        break;
      case 'ArrowUp':
        state.open('last');
        break;
      case 'ArrowLeft':
        state.selectionManager.setFocusedKey(null);
        break;
      case 'ArrowRight':
        state.selectionManager.setFocusedKey(null);
        break;
    }
  };

  let onBlur = (e) => {
    // Early return in the following cases so we don't change textfield focus state, update the selected key erroneously,
    // and trigger close menu twice:
    // If user is clicking on the combobox trigger button butto
    // If focus is moved into the popover (e.g. when focus is moved to the Tray's input field, mobile case).
    // If the tray input is blurred and the relatedTarget is null (e.g. switching browser tabs or tapping on the tray empty space)
    if ((triggerRef?.current && triggerRef.current.contains(e.relatedTarget)) || (popoverRef?.current && popoverRef.current.contains(e.relatedTarget)) || (isMobile && state.isOpen && e.relatedTarget === null)) {
      return;
    }

    state.close();

    if (props.onBlur) {
      props.onBlur(e);
    }

    state.setFocused(false);

    if (focusedItem && shouldSelectOnBlur) {
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
      // Call state.setFocused still so the setFocused(false) call generated by the tray's input onBlur from tray closure is overwritten
      state.setFocused(true);
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
    onKeyDown: !isReadOnly && chain(state.isOpen && collectionProps.onKeyDownCapture, onKeyDown),
    onBlur,
    value: state.inputValue,
    onFocus,
    autoComplete: 'off'
  }, inputRef);

  let {pressProps: inputPressProps} = usePress({
    onPress: () => {
      if (isMobile && !isReadOnly) {
        state.open();
      }
    },
    isDisabled,
    ref: inputRef
  });

  // Return focus to textfield if user clicks menu trigger button
  // Don't need to handle the state.close() when pressing the trigger button since useInteractOutside will call it for us
  let onPress = (e) => {
    if (e.pointerType === 'touch') {
      inputRef.current.focus();
      if (!state.isOpen) {
        state.open();
      }
    }
  };

  let onPressStart = (e) => {
    if (e.pointerType !== 'touch') {
      inputRef.current.focus();
      if (!state.isOpen) {
        state.open(e.pointerType === 'keyboard' || e.pointerType === 'virtual' ? 'first' : null);
      }
    }
  };

  let lastValue = useRef(state.inputValue);
  useEffect(() => {
    // Close combobox menu if user clears input text unless trigger is focus or is in mobile view (as per design)
    if (lastValue.current !== state.inputValue) {
      if (state.inputValue === '' && menuTrigger !== 'focus' && !isMobile) {
        state.close();
      }
    }

    lastValue.current = state.inputValue;
  }, [state, menuTrigger, isMobile]);

  let prevOpenState = useRef(state.isOpen);
  useEffect(() => {
    if (!state.isOpen && prevOpenState.current !== state.isOpen) {
      // Clear focused key whenever combobox menu closes so opening the menu via pressing the open button doesn't autofocus the last focused key
      state.selectionManager.setFocusedKey(null);

      // Refocus input when mobile tray closes for any reason
      if (isMobile) {
        inputRef.current.focus();
      }
    }

    prevOpenState.current = state.isOpen;
  }, [state.isOpen, inputRef, isMobile, state.selectionManager]);

  let triggerLabelProps = useLabels({
    id: menuTriggerProps.id,
    'aria-label': 'Show suggestions',
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  let listBoxProps = useLabels({
    id: menuProps.id,
    'aria-label': 'Suggestions',
    'aria-labelledby': props['aria-labelledby'] || labelProps.id
  });

  return {
    labelProps,
    triggerProps: {
      ...menuTriggerProps,
      ...triggerLabelProps,
      excludeFromTabOrder: true,
      onPress,
      onPressStart
    },
    inputProps: {
      // Only add the inputPressProps if mobile so that text highlighting via mouse click + drag works on desktop
      ...mergeProps(inputProps, isMobile ? inputPressProps : {}),
      role: 'combobox',
      'aria-expanded': menuTriggerProps['aria-expanded'],
      'aria-controls': state.isOpen ? menuId || menuProps.id : undefined,
      'aria-autocomplete': completionMode === 'suggest' ? 'list' : 'both',
      'aria-activedescendant': focusedKeyId
    },
    listBoxProps: mergeProps(menuProps, listBoxProps)
  };
}
