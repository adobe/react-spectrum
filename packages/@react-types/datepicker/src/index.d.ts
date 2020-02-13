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
import {DOMProps, InputBase, LabelableProps, RangeValue, SpectrumLabelableProps, StyleProps, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
interface DatePickerBase extends InputBase, LabelableProps {
  minValue?: DateValue,
  maxValue?: DateValue,
  formatOptions?: Intl.DateTimeFormatOptions,
  placeholderDate?: DateValue
}

export interface DatePickerProps extends DatePickerBase, ValueBase<DateValue> {}

export type DateRange = RangeValue<DateValue>;
export interface DateRangePickerProps extends DatePickerBase, ValueBase<DateRange> {}

interface SpectrumDatePickerBase extends SpectrumLabelableProps, DOMProps, StyleProps {
  isQuiet?: boolean
}

export interface SpectrumDatePickerProps extends DatePickerProps, SpectrumDatePickerBase {}
export interface SpectrumDateRangePickerProps extends DateRangePickerProps, SpectrumDatePickerBase {}
