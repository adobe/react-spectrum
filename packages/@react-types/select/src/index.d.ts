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

import {
  Alignment,
  AriaLabelingProps,
  AsyncLoadable,
  CollectionBase,
  DimensionValue,
  DOMProps,
  FocusableDOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase,
  Key,
  LabelableProps,
  SingleSelection,
  SpectrumLabelableProps,
  StyleProps,
  TextInputBase,
  Validation
} from '@react-types/shared';

export interface SelectProps<T> extends CollectionBase<T>, Omit<InputBase, 'isReadOnly'>, Validation<Key>, HelpTextProps, LabelableProps, TextInputBase, Omit<SingleSelection, 'disallowEmptySelection'>, FocusableProps {
  /** Sets the open state of the menu. */
  isOpen?: boolean,
  /** Sets the default open state of the menu. */
  defaultOpen?: boolean,
  /** Method that is called when the open state of the menu changes. */
  onOpenChange?: (isOpen: boolean) => void
}

export interface AriaSelectProps<T> extends SelectProps<T>, DOMProps, AriaLabelingProps, FocusableDOMProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string,
  /**
   * The name of the input, used when submitting an HTML form.
   */
  name?: string
}

export interface SpectrumPickerProps<T> extends AriaSelectProps<T>, AsyncLoadable, SpectrumLabelableProps, StyleProps  {
  /** Whether the textfield should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Alignment of the menu relative to the input target.
   * @default 'start'
   */
  align?: Alignment,
  /**
   * Direction the menu will render relative to the Picker.
   * @default 'bottom'
   */
  direction?: 'bottom' | 'top',
  /**
   * Whether the menu should automatically flip direction when space is limited.
   * @default true
   */
  shouldFlip?: boolean,
  /** Width of the menu. By default, matches width of the trigger. Note that the minimum width of the dropdown is always equal to the trigger's width. */
  menuWidth?: DimensionValue,
  /** Whether the element should receive focus on render. */
  autoFocus?: boolean
}
