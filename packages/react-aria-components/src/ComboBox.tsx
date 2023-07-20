/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AriaComboBoxProps, useComboBox, useFilter} from 'react-aria';
import {ButtonContext} from './Button';
import {ComboBoxState, useComboBoxState, ValidationState} from 'react-stately';
import {ContextValue, forwardRefType, Provider, RenderProps, slotCallbackSymbol, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps, useResizeObserver} from '@react-aria/utils';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import {ListBoxContext, ListBoxProps} from './ListBox';
import {PopoverContext} from './Popover';
import React, {createContext, ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState} from 'react';
import {TextContext} from './Text';
import {useCollection} from './Collection';

export interface ComboBoxRenderProps {
  /**
   * Whether the combobox is currently open.
   * @selector [data-open]
   */
  isOpen: boolean,
  /**
   * Whether the combobox is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Validation state of the combobox.
   * @selector [data-validation-state="valid | invalid"]
   */
  validationState: ValidationState | undefined,
  /**
   * Whether the combobox is required.
   * @selector [data-required]
   */
  isRequired: boolean,
  /**
   * State of the combobox.
   */
  state: Omit<ComboBoxState<unknown>, 'children' | 'setOpen' | 'toggle' | 'open' | 'close' | 'selectionManager' | 'setSelectedKey' | 'setFocused' | 'collection' | 'commit' | 'revert'>
}

export interface ComboBoxProps<T extends object> extends Omit<AriaComboBoxProps<T>, 'children' | 'placeholder' | 'label' | 'description' | 'errorMessage'>, RenderProps<ComboBoxRenderProps>, SlotProps {
  /** The filter function used to determine if a option should be included in the combo box list. */
  defaultFilter?: (textValue: string, inputValue: string) => boolean,
  /**
   * Whether the text or key of the selected item is submitted as part of an HTML form.
   * When `allowsCustomValue` is `true`, this option does not apply and the text is always submitted.
   * @default 'key'
   */
  formValue?: 'text' | 'key'
}

export const ComboBoxContext = createContext<ContextValue<ComboBoxProps<any>, HTMLDivElement>>(null);

function ComboBox<T extends object>(props: ComboBoxProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ComboBoxContext);
  let [propsFromListBox, setListBoxProps] = useState<ListBoxProps<T>>({children: []});
  let {
    name,
    formValue = 'key',
    allowsCustomValue
  } = props;
  if (allowsCustomValue) {
    formValue = 'text';
  }

  let {contains} = useFilter({sensitivity: 'base'});
  let {portal, collection} = useCollection({
    items: props.items ?? props.defaultItems ?? propsFromListBox.items,
    children: propsFromListBox.children
  });
  let state = useComboBoxState({
    defaultFilter: props.defaultFilter || contains,
    ...props,
    // If props.items isn't provided, rely on collection filtering (aka listbox.items is provided or defaultItems provided to Combobox)
    items: props.items,
    children: undefined,
    collection
  });

  // Only expose a subset of state to renderProps function to avoid infinite render loop
  let renderPropsState = useMemo(() => ({
    isOpen: state.isOpen,
    isDisabled: props.isDisabled || false,
    validationState: props.validationState,
    isRequired: props.isRequired || false,
    state: {
      focusStrategy: state.focusStrategy,
      isOpen: state.isOpen,
      selectedKey: state.selectedKey,
      disabledKeys: state.disabledKeys,
      isFocused: state.isFocused,
      selectedItem: state.selectedItem,
      inputValue: state.inputValue,
      setInputValue: state.setInputValue
    }
  }), [state.isOpen, state.isFocused, state.focusStrategy, state.selectedKey, state.disabledKeys, state.selectedItem, state.inputValue, state.setInputValue, props.isDisabled, props.validationState, props.isRequired]);
  let buttonRef = useRef<HTMLButtonElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);
  let listBoxRef = useRef<HTMLDivElement>(null);
  let popoverRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps,
    descriptionProps,
    errorMessageProps
  } = useComboBox({
    ...props,
    label,
    inputRef,
    buttonRef,
    listBoxRef,
    popoverRef,
    name: formValue === 'text' ? name : undefined
  },
  state);

  // Make menu width match input + button
  let [menuWidth, setMenuWidth] = useState<string | null>(null);
  let onResize = useCallback(() => {
    if (inputRef.current) {
      let buttonRect = buttonRef.current?.getBoundingClientRect();
      let inputRect = inputRef.current.getBoundingClientRect();
      let minX = buttonRect ? Math.min(buttonRect.left, inputRect.left) : inputRect.left;
      let maxX = buttonRect ? Math.max(buttonRect.right, inputRect.right) : inputRect.right;
      setMenuWidth((maxX - minX) + 'px');
    }
  }, [buttonRef, inputRef, setMenuWidth]);

  useResizeObserver({
    ref: inputRef,
    onResize: onResize
  });

  let renderProps = useRenderProps({
    ...props,
    values: renderPropsState,
    defaultClassName: 'react-aria-ComboBox'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <Provider
      values={[
        [LabelContext, {...labelProps, ref: labelRef}],
        [ButtonContext, {...buttonProps, ref: buttonRef, isPressed: state.isOpen}],
        [InputContext, {...inputProps, ref: inputRef}],
        [PopoverContext, {
          state,
          ref: popoverRef,
          triggerRef: inputRef,
          placement: 'bottom start',
          preserveChildren: true,
          isNonModal: true,
          style: {'--trigger-width': menuWidth} as React.CSSProperties
        }],
        [ListBoxContext, {state, [slotCallbackSymbol]: setListBoxProps, ...listBoxProps, ref: listBoxRef}],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div
        {...DOMProps}
        {...renderProps}
        ref={ref}
        slot={props.slot}
        data-focused={state.isFocused || undefined}
        data-open={state.isOpen || undefined}
        data-disabled={props.isDisabled || undefined}
        data-validation-state={props.validationState || undefined}
        data-required={props.isRequired || undefined} />
      {portal}
      {name && formValue === 'key' && <input type="hidden" name={name} value={state.selectedKey} />}
    </Provider>
  );
}

/**
 * A combo box combines a text input with a listbox, allowing users to filter a list of options to items matching a query.
 */
const _ComboBox = /*#__PURE__*/ (forwardRef as forwardRefType)(ComboBox);
export {_ComboBox as ComboBox};
