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

import {AriaDatePickerProps} from '@react-aria/datepicker';
import {DateValue, TimeValue} from '@react-stately/datepicker';
import {SpectrumTimeFieldProps} from '@react-spectrum/datepicker';

export {DateValue, DateRange, TimeValue, MappedDateValue, MappedTimeValue, Granularity, DateFieldProps, DatePickerProps, DateRangePickerProps, TimePickerProps} from '@react-stately/datepicker';
export {AriaDateFieldProps, AriaDatePickerProps, AriaDateRangePickerProps, AriaTimeFieldProps} from '@react-aria/datepicker';
export {SpectrumDatePickerProps, SpectrumDateRangePickerProps, SpectrumDateFieldProps, SpectrumTimeFieldProps} from '@react-spectrum/datepicker';

// backward compatibility
export type AriaDatePickerBaseProps<T extends DateValue> = AriaDatePickerProps<T>;
export type SpectrumTimePickerProps<T extends TimeValue> = SpectrumTimeFieldProps<T>;
