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

import {FocusableProps, HelpTextProps, InputBase, LabelableProps, TextInputBase, Validation, ValueBase} from '@react-types/shared';
import {FormValidationState, useFormValidationState} from '../form/useFormValidationState';
import {useControlledStateAction} from '../utils/useControlledStateAction';

export interface TextFieldProps<T = HTMLInputElement> extends InputBase, Validation<string>, HelpTextProps, FocusableProps<T>, TextInputBase, ValueBase<string>, LabelableProps {
  /** Async action that is called when the value changes. */
  changeAction?: (value: string) => void | Promise<void>
}

export interface TextFieldState extends FormValidationState {
  /** The current value of the search field. */
  readonly value: string,

  /** Sets the value of the search field. */
  setValue(value: string): void,

  /** Whether an action is pending. */
  isPending: boolean
}

/**
 * Provides state management for a text field.
 */
export function useTextFieldState(props: TextFieldProps<any>): TextFieldState {
  let [value, isPending, setValue, actionError] = useControlledStateAction(props.value, props.defaultValue || '', props.onChange, props.changeAction);
  let validationState = useFormValidationState({
    ...props,
    actionError,
    value
  });

  return {
    ...validationState,
    value,
    setValue,
    isPending
  };
}
