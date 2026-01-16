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

import {AriaButtonProps} from '@react-aria/button';
import {AriaLabelingProps, CollectionBase, DOMAttributes, DOMProps, Key, KeyboardDelegate, LayoutDelegate, RefObject, ValidationResult} from '@react-types/shared';
import {AriaListBoxOptions} from '@react-aria/listbox';
import {AriaSearchFieldProps, useSearchField} from '@react-aria/searchfield';
import {ComboBoxState, MenuTriggerAction} from '@react-stately/combobox';
import {InputHTMLAttributes} from 'react';
import {mergeProps} from '@react-aria/utils';
import {SearchFieldProps} from '@react-stately/searchfield';
import {useComboBox} from '@react-aria/combobox';

export interface SearchAutocompleteProps<T> extends CollectionBase<T>, Omit<SearchFieldProps, 'onSubmit' | 'defaultValue' | 'value'> {
  /** The list of SearchAutocomplete items (uncontrolled). */
  defaultItems?: Iterable<T>,
  /** The list of SearchAutocomplete items (controlled). */
  items?: Iterable<T>,
  /** Method that is called when the open state of the menu changes. Returns the new open state and the action that caused the opening of the menu. */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void,
  /** The value of the SearchAutocomplete input (controlled). */
  inputValue?: string,
  /** The default value of the SearchAutocomplete input (uncontrolled). */
  defaultInputValue?: string,
  /** Handler that is called when the SearchAutocomplete input value changes. */
  onInputChange?: (value: string) => void,
  /**
   * The interaction required to display the SearchAutocomplete menu.
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction,
  /** Handler that is called when the SearchAutocomplete is submitted.
   *
   * A `value` will be passed if the submission is a custom value (e.g. a user types then presses enter).
   * If the input is a selected item, `value` will be null.
   *
   * A `key` will be passed if the submission is a selected item (e.g. a user clicks or presses enter on an option).
   * If the input is a custom value, `key` will be null.
   */
  onSubmit?: (value: string | null, key: Key | null) => void
}

export interface AriaSearchAutocompleteProps<T> extends SearchAutocompleteProps<T>, Omit<AriaSearchFieldProps, 'onSubmit' | 'defaultValue' | 'value'>, DOMProps, AriaLabelingProps {}

export interface SearchAutocompleteAria<T> extends ValidationResult {
  /** Props for the label element. */
  labelProps: DOMAttributes,
  /** Props for the search input element. */
  inputProps: InputHTMLAttributes<HTMLInputElement>,
  /** Props for the list box, to be passed to `useListBox`. */
  listBoxProps: AriaListBoxOptions<T>,
  /** Props for the search input's clear button. */
  clearButtonProps: AriaButtonProps,
  /** Props for the search autocomplete description element, if any. */
  descriptionProps: DOMAttributes,
  /** Props for the search autocomplete error message element, if any. */
  errorMessageProps: DOMAttributes
}

export interface AriaSearchAutocompleteOptions<T> extends AriaSearchAutocompleteProps<T> {
  /** The ref for the input element. */
  inputRef: RefObject<HTMLInputElement | null>,
  /** The ref for the list box popover. */
  popoverRef: RefObject<HTMLDivElement | null>,
  /** The ref for the list box. */
  listBoxRef: RefObject<HTMLElement | null>,
  /** An optional keyboard delegate implementation, to override the default. */
  keyboardDelegate?: KeyboardDelegate,
  /**
   * A delegate object that provides layout information for items in the collection.
   * By default this uses the DOM, but this can be overridden to implement things like
   * virtualized scrolling.
   */
  layoutDelegate?: LayoutDelegate
}

/**
 * Provides the behavior and accessibility implementation for a search autocomplete component.
 * A search autocomplete combines a combobox with a searchfield, allowing users to filter a list of options to items matching a query.
 * @param props - Props for the search autocomplete.
 * @param state - State for the search autocomplete, as returned by `useSearchAutocomplete`.
 */
export function useSearchAutocomplete<T>(props: AriaSearchAutocompleteOptions<T>, state: ComboBoxState<T>): SearchAutocompleteAria<T> {
  let {
    popoverRef,
    inputRef,
    listBoxRef,
    keyboardDelegate,
    layoutDelegate,
    onSubmit = () => {},
    onClear,
    onKeyDown,
    onKeyUp,
    isInvalid,
    validationState,
    validationBehavior,
    isRequired,
    ...otherProps
  } = props;

  let {inputProps, clearButtonProps} = useSearchField({
    ...otherProps,
    value: state.inputValue,
    onChange: state.setInputValue,
    autoComplete: 'off',
    onClear: () => {
      state.setInputValue('');
      if (onClear) {
        onClear();
      }
    },
    onSubmit: (value) => {
      // Prevent submission from search field if menu item was selected
      if (state.selectionManager.focusedKey === null) {
        onSubmit(value, null);
      }
    },
    onKeyDown,
    onKeyUp
  }, {
    value: state.inputValue,
    setValue: state.setInputValue
  }, inputRef);


  let {listBoxProps, labelProps, inputProps: comboBoxInputProps, ...validation} = useComboBox(
    {
      ...otherProps,
      keyboardDelegate,
      layoutDelegate,
      popoverRef,
      listBoxRef,
      inputRef,
      onFocus: undefined,
      onFocusChange: undefined,
      onBlur: undefined,
      onKeyDown: undefined,
      onKeyUp: undefined,
      isInvalid,
      validationState,
      validationBehavior,
      isRequired,
      validate: undefined
    },
    state
  );

  return {
    labelProps,
    inputProps: mergeProps(inputProps, comboBoxInputProps),
    listBoxProps,
    clearButtonProps,
    ...validation
  };
}
