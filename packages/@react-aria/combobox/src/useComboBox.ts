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


 // TODO: Move the below into combobox types
import {chain, mergeProps} from '@react-aria/utils';
import {CollectionBase, SingleSelection} from '@react-types/shared';
import {ComboBoxState} from '@react-stately/combobox';
import {FocusEvent, HTMLAttributes, useEffect, useState} from 'react';
import {useMenuTrigger} from '@react-aria/menu';
import {useSelectableCollection} from '@react-aria/selection';
import {useTextField} from '@react-aria/textfield';

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
  menuTrigger?: 'focus' | 'input' | 'manual',
  shouldFlip?: boolean
}

interface AriaComboBoxProps<T> extends ComboBoxProps<T> {
  triggerRef,
  inputRef,
  layout,
  popoverRef,
  onBlur?: (e: FocusEvent<Element>) => void, // don't think these two (blur/focus) should be added?
  onFocus?: (e: FocusEvent<Element>) => void
}

interface ComboBoxAria {
  triggerProps: HTMLAttributes<HTMLElement>,
  inputProps: HTMLAttributes<HTMLElement>,
  menuProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>
}

export function useComboBox<T>(props: AriaComboBoxProps<T>, state: ComboBoxState<T>): ComboBoxAria {
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
  let onChange = (val) => {
    state.setValue(val);
  };

  useEffect(() => {
    if (props.menuTrigger === 'input' && state.value.length > 0 && state.collection.size > 0) {
      state.open(); // is this right? at this time, we haven't filtered, so we don't know if the character they type will result in an empty menu
    } else if (state.collection && state.collection.size === 0) {
      state.close();
    }
  }, [state.collection, state.value, props.menuTrigger]);

  useEffect(() => {
    let selectedItem = state.selectedKey ? state.collection.getItem(state.selectedKey) : null;
    if (selectedItem) {
      let itemText = selectedItem.textValue || selectedItem.rendered as string; // how should we handle this? rendered is typed as an object

      // Throw error if controlled inputValue and controlled selectedKey don't match
      if (props.inputValue && props.selectedKey && (props.inputValue !== itemText)) {
        throw new Error('Mismatch between selected item and inputValue!');
      }

      // Update textfield value if new item is selected
      if (itemText !== state.value) {
        state.setValue(itemText);
      }
    }
  }, [state.selectedKey, props.inputValue, props.selectedKey]);


  // TODO: Refine the below, feels weird to have focusedItem and also need to still do state.selectionManger.focusedKey
  let [focusedKeyId, setFocusedKeyId] = useState(null);
  let focusedItem = state.selectionManager.focusedKey ? state.collection.getItem(state.selectionManager.focusedKey) : null;
  useEffect(() => {
    if (focusedItem) {
      setFocusedKeyId(`${menuProps.id}-option-${focusedItem.key}`);
    }
  }, [state.selectionManager.focusedKey, state.collection, focusedItem, setFocusedKeyId, menuProps.id]);


  // Using layout initiated from ComboBox, generate the keydown handlers for textfield (arrow up/down to navigate through menu when focus in the textfield)
  let {collectionProps} = useSelectableCollection({
    selectionManager: state.selectionManager,
    keyboardDelegate: props.layout,
    shouldTypeAhead: false,
    disallowEmptySelection: true
  });

  let onBlur = () => {
    if (state.isOpen && focusedItem) {
      state.setSelectedKey(state.selectionManager.focusedKey);
    }

    // A bit strange behavior when isOpen is true, menu can't close so you can't tab away from the
    // textfield, almost like a focus trap
    state.close();
  };

  // For textfield specific keydown operations
  let onKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        if (state.isOpen && focusedItem) {
          state.setSelectedKey(state.selectionManager.focusedKey);
          state.close();
        }

        break;
      case 'Escape':
        state.close();
        break;
      case 'ArrowDown':
        if (!state.isOpen) {
          state.toggle('first');
        } else if (!focusedItem) {
          let firstKey = state.collection.getFirstKey();
          state.selectionManager.setFocusedKey(firstKey);
        }

        break;
      case 'ArrowUp':
        if (!state.isOpen) {
          state.toggle('last');
        } else if (!focusedItem) {
          let firstKey = state.collection.getFirstKey();
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

  let {labelProps, inputProps} = useTextField({
    ...props,
    onChange,
    onKeyDown: chain(collectionProps.onKeyDown, onKeyDown),
    onBlur: chain(props.onBlur, onBlur),
    value: state.value
  }, props.inputRef);

  return {
    labelProps,
    triggerProps: {
      ...mergeProps({onPressStart, onPress}, menuTriggerProps),
      tabIndex: -1
    },
    inputProps: {
      // TODO: double check that user provided id gets sent to textfield and not to wrapper div
      ...inputProps,
      role: 'combobox',
      'aria-controls': state.isOpen ? menuProps.id : undefined,
      'aria-autocomplete': props.completionMode === 'suggest' ? 'list' : 'both',
      'aria-activedescendant': state.isOpen ? focusedKeyId : undefined
    },
    menuProps
  };
}
