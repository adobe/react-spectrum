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

import {AsyncLoadable, CollectionBase, DOMProps, FocusableProps, HelpTextProps, InputBase, LabelableProps, LoadingState, SingleSelection, SpectrumLabelableProps, StyleProps, TextInputBase, Validation} from '@react-types/shared';

export type MenuTriggerAction = 'focus' | 'input' | 'manual';

export interface AutocompleteProps<T> extends CollectionBase<T>, SingleSelection, InputBase, TextInputBase, DOMProps, Validation, FocusableProps, LabelableProps, HelpTextProps {
  /** The list of Autocomplete items (uncontrolled). */
  defaultItems?: Iterable<T>,
  /** The list of Autocomplete items (controlled). */
  items?: Iterable<T>,
  /** Method that is called when the open state of the menu changes. Returns the new open state and the action that caused the opening of the menu. */
  onOpenChange?: (isOpen: boolean, menuTrigger?: MenuTriggerAction) => void,
  /** The value of the Autocomplete input (controlled). */
  inputValue?: string,
  /** The default value of the Autocomplete input (uncontrolled). */
  defaultInputValue?: string,
  /** Handler that is called when the Autocomplete input value changes. */
  onInputChange?: (value: string) => void,
  /** Whether the Autocomplete allows a non-item matching input value to be set. */
  allowsCustomValue?: boolean,
  /**
   * The interaction required to display the Autocomplete menu.
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction
}

export interface SpectrumAutocompleteProps<T> extends Omit<AutocompleteProps<T>, 'menuTrigger'>, SpectrumLabelableProps, StyleProps, Omit<AsyncLoadable, 'isLoading'> {
  /**
   * The interaction required to display the Autocomplete menu. Note that this prop has no effect on the mobile Autocomplete experience.
   * @default 'input'
   */
  menuTrigger?: MenuTriggerAction,
  /** Whether the Autocomplete should be displayed with a quiet style. */
  isQuiet?: boolean,
  /**
   * Direction the menu will render relative to the Autocomplete.
   * @default 'bottom'
   */
  direction?: 'bottom' | 'top',
  /** The current loading state of the Autocomplete. Determines whether or not the progress circle should be shown. */
  loadingState?: LoadingState,
  /**
   * Whether the menu should automatically flip direction when space is limited.
   * @default true
   */
  shouldFlip?: boolean
}
