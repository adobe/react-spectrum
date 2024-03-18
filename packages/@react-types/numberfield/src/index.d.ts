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
  AriaLabelingProps,
  DOMProps,
  FocusableProps,
  HelpTextProps,
  InputBase, InputDOMProps, LabelableProps,
  RangeInputBase, SpectrumFieldValidation, SpectrumLabelableProps,
  StyleProps,
  TextInputBase,
  TextInputDOMEvents,
  Validation,
  ValueBase
} from '@react-types/shared';

export interface NumberFieldProps extends InputBase, Validation<number>, FocusableProps, TextInputBase, ValueBase<number>, RangeInputBase<number>, LabelableProps, HelpTextProps {
  /**
   * Formatting options for the value displayed in the number field.
   * This also affects what characters are allowed to be typed by the user.
   */
  formatOptions?: Intl.NumberFormatOptions
}

export interface AriaNumberFieldProps extends NumberFieldProps, DOMProps, AriaLabelingProps, TextInputDOMEvents {
  /** A custom aria-label for the decrement button. If not provided, the localized string "Decrement" is used. */
  decrementAriaLabel?: string,
  /** A custom aria-label for the increment button. If not provided, the localized string "Increment" is used. */
  incrementAriaLabel?: string,
  /**
   * Enables or disables changing the value with scroll.
   */
  isWheelDisabled?: boolean
}

export interface SpectrumNumberFieldProps extends Omit<AriaNumberFieldProps, 'placeholder' | 'isInvalid' | 'validationState'>, SpectrumFieldValidation<number>, InputDOMProps, StyleProps, SpectrumLabelableProps {
  /** Whether the numberfield should be displayed with a quiet style. */
  isQuiet?: boolean,
  /** Whether to hide the increment and decrement buttons. */
  hideStepper?: boolean
}
