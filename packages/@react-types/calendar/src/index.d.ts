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
import {DOMProps, RangeValue, StyleProps, ValueBase} from '@react-types/shared';

export type DateValue = string | number | Date;
export interface CalendarPropsBase {
  minValue?: DateValue,
  maxValue?: DateValue,
  isDisabled?: boolean,
  isReadOnly?: boolean,
  autoFocus?: boolean
}

export interface CalendarProps extends CalendarPropsBase, ValueBase<DateValue> {}
export interface RangeCalendarProps extends CalendarPropsBase, ValueBase<RangeValue<DateValue>> {}

export interface SpectrumCalendarProps extends CalendarProps, DOMProps, StyleProps {}
export interface SpectrumRangeCalendarProps extends RangeCalendarProps, DOMProps, StyleProps {}
