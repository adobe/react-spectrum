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

import {SearchFieldProps} from '@react-types/searchfield';
import {useControlledState} from '@react-stately/utils';

export interface SearchFieldState {
  /** The current value of the search field. */
  readonly value: string,

  /** Sets the value of the search field. */
  setValue(value: string): void
}

/**
 * Provides state management for a search field.
 */
export function useSearchFieldState(props: SearchFieldProps): SearchFieldState {
  let [value, setValue] = useControlledState(toString(props.value), toString(props.defaultValue) || '', props.onChange);

  return {
    value,
    setValue
  };
}

function toString(val) {
  if (val == null) {
    return;
  }

  return val.toString();
}
