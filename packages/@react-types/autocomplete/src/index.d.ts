/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, AsyncLoadable, CollectionBase, DimensionValue, DOMProps, Key, LoadingState, SpectrumFieldValidation, SpectrumLabelableProps, SpectrumTextInputBase, StyleProps} from '@react-types/shared';
import {AriaSearchFieldProps, SearchFieldProps} from '@react-types/searchfield';
import {MenuTriggerAction} from '@react-types/combobox';
import {ReactElement} from 'react';

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

export interface SpectrumSearchAutocompleteProps<T> extends SpectrumTextInputBase, Omit<AriaSearchAutocompleteProps<T>, 'menuTrigger' | 'isInvalid' | 'validationState' | 'validate'>, SpectrumFieldValidation<string>, SpectrumLabelableProps, StyleProps, Omit<AsyncLoadable, 'isLoading'> {
  /**
   * The interaction required to display the SearchAutocomplete menu. Note that this prop has no effect on the mobile SearchAutocomplete experience.
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction,
  /** Whether the SearchAutocomplete should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Alignment of the menu relative to the input target.
   * @default 'start'
   */
  align?: 'start' | 'end',
  /**
   * Direction the menu will render relative to the SearchAutocomplete.
   * @default 'bottom'
   */
  direction?: 'bottom' | 'top',
  /** The current loading state of the SearchAutocomplete. Determines whether or not the progress circle should be shown. */
  loadingState?: LoadingState,
  /**
   * Whether the menu should automatically flip direction when space is limited.
   * @default true
   */
  shouldFlip?: boolean,
  /** Width of the menu. By default, matches width of the trigger. Note that the minimum width of the dropdown is always equal to the trigger's width. */
  menuWidth?: DimensionValue,
  onLoadMore?: () => void,
  /** An icon to display at the start of the input. */
  icon?: ReactElement | null
}
