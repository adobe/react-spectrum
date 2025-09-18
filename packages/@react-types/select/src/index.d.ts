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
  Validation,
  ValueBase
} from '@react-types/shared';

export type SelectionMode = 'single' | 'multiple';
export type ValueType<M extends SelectionMode> = M extends 'single' ? Key | null : Key[];
type ValidationType<M extends SelectionMode> = M extends 'single' ? Key : Key[];

export interface SelectProps<T, M extends SelectionMode = 'single'> extends CollectionBase<T>, Omit<InputBase, 'isReadOnly'>, ValueBase<ValueType<M>>, Validation<ValidationType<M>>, HelpTextProps, LabelableProps, TextInputBase, FocusableProps {
  /**
   * Whether single or multiple selection is enabled.
   * @default 'single'
   */
  selectionMode?: M,
  /**
   * The currently selected key in the collection (controlled).
   * @deprecated
   */
  selectedKey?: Key | null,
  /**
   * The initial selected key in the collection (uncontrolled).
   * @deprecated
   */
  defaultSelectedKey?: Key,
  /**
   * Handler that is called when the selection changes.
   * @deprecated
   */
  onSelectionChange?: (key: Key | null) => void,
  /** Sets the open state of the menu. */
  isOpen?: boolean,
  /** Sets the default open state of the menu. */
  defaultOpen?: boolean,
  /** Method that is called when the open state of the menu changes. */
  onOpenChange?: (isOpen: boolean) => void
}

export interface AriaSelectProps<T, M extends SelectionMode = 'single'> extends SelectProps<T, M>, DOMProps, AriaLabelingProps, FocusableDOMProps {
  /**
   * Describes the type of autocomplete functionality the input should provide if any. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautocomplete).
   */
  autoComplete?: string,
  /**
   * The name of the input, used when submitting an HTML form.
   */
  name?: string,
  /**
   * The `<form>` element to associate the input with.
   * The value of this attribute must be the id of a `<form>` in the same document.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form).
   */
  form?: string
}

export interface SpectrumPickerProps<T> extends Omit<AriaSelectProps<T>, 'selectionMode' | 'selectedKey' | 'defaultSelectedKey' | 'onSelectionChange' | 'value' | 'defaultValue' | 'onChange'>, Omit<SingleSelection, 'disallowEmptySelection'>, AsyncLoadable, SpectrumLabelableProps, StyleProps  {
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
