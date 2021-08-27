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

import {DatePickerField} from './DatePickerField';
import {DateValue, SpectrumDatePickerProps} from '@react-types/datepicker';
import {FocusScope} from '@react-aria/focus';
import React from 'react';
import {useProviderProps} from '@react-spectrum/provider';

export function DateField<T extends DateValue>(props: SpectrumDatePickerProps<T>) {
  props = useProviderProps(props);
  let {
    autoFocus
  } = props;

  return (
    <FocusScope autoFocus={autoFocus}>
      <DatePickerField {...props} />
    </FocusScope>
  );
}
