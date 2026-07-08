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

import {TokenSegmentList} from './TokenSegmentList';
import {useControlledState} from '../utils/useControlledState';
import {ValueBase} from '@react-types/shared';

export interface TokenFieldProps<
  T extends TokenSegmentList = TokenSegmentList
> extends ValueBase<T> {}

export interface TokenFieldState<T extends TokenSegmentList = TokenSegmentList> {
  value: T;
  setValue: (fn: T | ((value: T) => T)) => void;
}

export function useTokenFieldState<T extends TokenSegmentList = TokenSegmentList>(
  props: TokenFieldProps<T>
) {
  let {
    value: valueProp,
    defaultValue: defaultValueProp = new TokenSegmentList([]),
    onChange
  } = props;

  let [value, setValue] = useControlledState(valueProp, defaultValueProp, onChange);

  return {
    value,
    setValue
  };
}
