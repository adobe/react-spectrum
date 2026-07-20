/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {TokenFieldValue} from './TokenFieldValue';
import {useControlledState} from '../utils/useControlledState';
import {useState} from 'react';
import {ValueBase} from '@react-types/shared';

export interface TokenFieldProps<
  T extends TokenFieldValue = TokenFieldValue
> extends ValueBase<T> {}

export interface TokenFieldState<T extends TokenFieldValue = TokenFieldValue> {
  /** The current value of the token field. */
  value: T;
  /** Sets the value of the token field. */
  setValue: (fn: T | ((value: T) => T)) => void;
  /** Whether the token field is composing. */
  isComposing: boolean;
  /** Sets the composing state of the token field. */
  setComposing: (isComposing: boolean) => void;
}

export function useTokenFieldState<T extends TokenFieldValue = TokenFieldValue>(
  props: TokenFieldProps<T>
): TokenFieldState<T> {
  let {
    value: valueProp,
    defaultValue: defaultValueProp = new TokenFieldValue([]),
    onChange
  } = props;

  let [value, setValue] = useControlledState(valueProp as any, defaultValueProp, onChange);
  let [isComposing, setComposing] = useState(false);

  return {
    value,
    setValue,
    isComposing,
    setComposing
  };
}
