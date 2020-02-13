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
import {PaginationProps} from '@react-types/pagination';
import {useControlledState} from '@react-stately/utils';
import {useRef} from 'react';

export interface PaginationState {
  onChange?: (val: string | number) => void,
  onDecrement?: () => void,
  onIncrement?: () => void,
  ref?: {current: number},
  value?: any
}

export function usePaginationState(props: PaginationProps): PaginationState {
  const [value, setValue] = useControlledState(props.value, props.defaultValue, props.onChange);
  let ref = useRef(value);

  const onPageInputChange = (value) => {
    if (value === '' || isValidPage(props.maxValue, value)) {
      value = value !== '' ? parseInt(value, 10) : value;
      setValue(value);
      ref.current = value;
    }
  };

  const onIncrement = () => {
    let val = (value === '') ? 1 : parseInt(value, 10) + 1;
    if (isValidPage(props.maxValue, val)) {
      ref.current = val;
      setValue(val);
    }
  };

  const onDecrement = () => {
    let val = (value === '') ? 1 : parseInt(value, 10) - 1;
    if (isValidPage(props.maxValue, val)) {
      ref.current = val;
      setValue(val);
    }
  };

  return {
    onChange: onPageInputChange,
    onDecrement,
    onIncrement,
    ref,
    value
  };
}

function isValidPage(totalPages, page) {
  page = parseInt(page, 10);
  totalPages = parseInt(totalPages, 10);
  return !isNaN(page) && (page >= 1 && totalPages && page <= totalPages);
}
