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

import {AsyncLoadable, CollectionBase, DOMProps, FocusableProps, InputBase, LoadingState, SingleSelection, SpectrumLabelableProps, StyleProps, TextInputBase, Validation} from '@react-types/shared';

export interface ComboBoxProps<T> extends CollectionBase<T>, SingleSelection, InputBase, TextInputBase, DOMProps, Validation, FocusableProps {
  /** The list of ComboBox items (uncontrolled). */
  defaultItems?: Iterable<T>,
  /** The list of ComboBox items (controlled). */
  items?: Iterable<T>,
  /** Sets the open state of the menu. */
  isOpen?: boolean,
  /** Sets the default open state of the menu. */
  defaultOpen?: boolean,
  /** Method that is called when the open state of the menu changes. */
  onOpenChange?: (isOpen: boolean) => void,
  /** The value of the ComboBox input (controlled). */
  inputValue?: string,
  /** The default value of the ComboBox input (uncontrolled). */
  defaultInputValue?: string,
  /** Handler that is called when the ComboBox input value changes. */
  onInputChange?: (value: string) => void,
  /** Whether the ComboBox allows a non-item matching input value to be set. */
  allowsCustomValue?: boolean,
  // /**
  //  * Whether the Combobox should only suggest matching options or autocomplete the field with the nearest matching option.
  //  * @default 'suggest'
  //  */
  // completionMode?: 'suggest' | 'complete',
  /**
   * The interaction required to display the ComboBox menu.
   * @default 'input'
   */
  menuTrigger?: 'focus' | 'input' | 'manual',
  /**
   * Whether the menu should automatically flip direction when space is limited.
   * @default true
   */
  shouldFlip?: boolean
}

export interface SpectrumComboBoxProps<T> extends ComboBoxProps<T>, SpectrumLabelableProps, StyleProps, Omit<AsyncLoadable, 'isLoading'> {
  /** Whether the ComboBox should be displayed with a quiet style. */
  isQuiet?: boolean,
  /**
   * Direction the menu will render relative to the ComboBox.
   * @default 'bottom'
   */
  direction?: 'bottom' | 'top',
  /** The current loading state of the ComboBox. Determines whether or not the progress circle should be shown. */
  loadingState?: LoadingState
}
