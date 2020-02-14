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

import {FocusableProps} from './events';

export type ValidationState = 'valid' | 'invalid';
export interface InputBase extends FocusableProps {
  isDisabled?: boolean,
  isRequired?: boolean,
  validationState?: ValidationState,
  isReadOnly?: boolean
}

export interface ValueBase<T> {
  value?: T,
  defaultValue?: T,
  onChange?: (value: T) => void,
}

export interface TextInputBase {
  placeholder?: string
}

export interface RangeValue<T> {
  start: T,
  end: T
}

export interface RangeInputBase<T> {
  minValue?: T,
  maxValue?: T,
  step?: T // ??
}
