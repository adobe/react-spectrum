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

import {ReactNode} from 'react';

export type ValidationState = 'valid' | 'invalid';
export type ValidationStateProp<T> = ValidationState | ((value: T) => ValidationState) | ExternalValidationState<T>;

export type ValidationFunction<T> = ((value: T) => string | true | null | undefined);
export interface ExternalValidationState<T> {
  /** The current error message shown to the user. */
  readonly errorMessage: string,
  /** The current validation details describing why an error occurred. */
  readonly validationDetails: ValidityState,
  /** The original validate function passed to `useValidationState`. */
  readonly validate: ValidationFunction<T>,
  /** Sets a custom error message for the field, e.g. as a result of server side validation.  */
  setError(errorMessage: string): void,
  /**
   * Sets the validation details and error message for the field.
   * Typically this is called internally, and is not used by application code.
   */
  setValidationDetails(validationDetails: ValidityState, errorMessage: string): void,
  /** Clears all validation errors. */
  clear(): void
}

export interface Validation<T> {
  /**
   * Whether the input should display its "valid" or "invalid" visual styling.
   * This overrides the `validate` prop, and the validation state is shown to the user immediately.
   */
  validationState?: ValidationState,
  /**
   * A function that returns an error message if a given value is invalid,
   * or an external validation state created with `useValidationState`.
   * Validation errors are displayed to the user when the form is submitted
   * if `validationBehavior="native"`. For realtime validation, use `validationState`.
   */
  validate?: ValidationFunction<T> | ExternalValidationState<T>,
  /**
   * Whether user input is required on the input before form submission.
   * This may block native HTML form submission or mark the input as invalid
   * via ARIA depending on the `validationBehavior` prop.
   */
  isRequired?: boolean,
  /**
   * Whether to use native HTML form validation to prevent form submission
   * when the value is missing or invalid, or mark the field as required
   * or invalid via ARIA.
   * @default 'aria'
   */
  validationBehavior?: 'aria' | 'native',
  /**
   * Handler that is called when input validation changes.
   */
  onValidationChange?: (state: FormValidationEvent) => void
}

export interface FormValidationEvent {
  /** Whether the input is invalid. */
  isInvalid: boolean,
  /** The current error message for the input if it is invalid, otherwise an empty string. */
  errorMessage: string,
  /** The native validation details for the input. */
  validationDetails: ValidityState
}

export interface InputBase {
  /** Whether the input is disabled. */
  isDisabled?: boolean,
  /** Whether the input can be selected but not changed by the user. */
  isReadOnly?: boolean
}

export interface ValueBase<T, C = T> {
  /** The current value (controlled). */
  value?: T,
  /** The default value (uncontrolled). */
  defaultValue?: T,
  /** Handler that is called when the value changes. */
  onChange?: (value: C) => void
}

export interface TextInputBase {
  /** Temporary text that occupies the text input when it is empty. */
  placeholder?: string
}

export interface SpectrumTextInputBase {
  /**
   * Temporary text that occupies the text input when it is empty.
   * Please use help text instead.
   * @deprecated
   **/
  placeholder?: string
}

export interface RangeValue<T> {
  /** The start value of the range. */
  start: T,
  /** The end value of the range. */
  end: T
}

export interface RangeInputBase<T> {
  /** The smallest value allowed for the input. */
  minValue?: T,
  /** The largest value allowed for the input. */
  maxValue?: T,
  /** The amount that the input value changes with each increment or decrement "tick". */
  step?: T // ??
}

export interface HelpTextProps {
  /** A description for the field. Provides a hint such as specific requirements for what to choose. */
  description?: ReactNode,
  /** An error message for the field. */
  errorMessage?: ReactNode
}

// Spectrum specific types. Extends `Validation` so that the `validationState` prop is available.
export interface SpectrumHelpTextProps extends HelpTextProps {
  /** Whether the description is displayed with lighter text. */
  isDisabled?: boolean,
  /** Whether an error icon is rendered. */
  showErrorIcon?: boolean,
  /** Whether the input should display its "valid" or "invalid" visual styling. */
  validationState?: ValidationState,
  /**
   * Whether user input is required on the input before form submission.
   * Often paired with the `necessityIndicator` prop to add a visual indicator to the input.
   */
  isRequired?: boolean,
}
