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
  AriaValidationProps,
  FocusableDOMProps,
  FocusableProps,
  FocusableRefValue,
  HelpTextProps,
  InputBase,
  LabelableProps,
  SpectrumFieldValidation,
  SpectrumLabelableProps,
  SpectrumTextInputBase,
  StyleProps,
  TextInputBase,
  TextInputDOMProps,
  Validation,
  ValueBase
} from '@react-types/shared';
import {ReactElement} from 'react';

export interface TextFieldProps<T = HTMLInputElement> extends InputBase, Validation<string>, HelpTextProps, FocusableProps<T>, TextInputBase, ValueBase<string>, LabelableProps {}

export interface AriaTextFieldProps<T = HTMLInputElement> extends TextFieldProps<T>, AriaLabelingProps, FocusableDOMProps, TextInputDOMProps, AriaValidationProps {
  // https://www.w3.org/TR/wai-aria-1.2/#textbox
  /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
  'aria-activedescendant'?: string,
  /**
   * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
   * presented if they are made.
   */
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both',
  /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
  'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog',
  /** Identifies the element (or elements) whose contents or presence are controlled by the current element. */
  'aria-controls'?: string,
  /**
   * An enumerated attribute that defines what action label or icon to preset for the enter key on virtual keyboards. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/enterkeyhint).
   */
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
}

interface SpectrumTextFieldBaseProps {
  /** An icon to display at the start of the input. */
  icon?: ReactElement | null,
  /** Whether the input should be displayed with a quiet style. */
  isQuiet?: boolean
}

export interface SpectrumTextFieldProps extends SpectrumTextFieldBaseProps, SpectrumTextInputBase, Omit<AriaTextFieldProps, 'isInvalid' | 'validationState'>, SpectrumFieldValidation<string>, SpectrumLabelableProps, StyleProps {}
export interface SpectrumTextAreaProps extends SpectrumTextFieldBaseProps, SpectrumTextInputBase, Omit<AriaTextFieldProps<HTMLTextAreaElement>, 'isInvalid' | 'validationState' | 'type' | 'pattern'>, SpectrumFieldValidation<string>, SpectrumLabelableProps, StyleProps {}

export interface TextFieldRef<T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> extends FocusableRefValue<T, HTMLDivElement> {
  select(): void,
  getInputElement(): T | null
}
