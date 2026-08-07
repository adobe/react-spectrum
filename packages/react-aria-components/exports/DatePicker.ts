/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Mark as a client only package. This will cause a build time error if you try
// to import it from a React Server Component in a framework like Next.js.
import 'client-only';

export {DatePicker, DatePickerContext, DatePickerStateContext} from '../src/DatePicker';
export type {DatePickerProps, DatePickerRenderProps} from '../src/DatePicker';
export type {DateValue, DatePickerState} from 'react-stately/useDatePickerState';

export {DateInput, DateSegment} from '../src/DateField';
export type {
  DateInputProps,
  DateInputRenderProps,
  DateSegmentProps,
  DateSegmentRenderProps
} from '../src/DateField';

export {Group} from '../src/Group';
export type {GroupProps, GroupRenderProps} from '../src/Group';

export {Label} from '../src/Label';
export type {LabelProps} from '../src/Label';

export {Text} from '../src/Text';
export type {TextProps} from '../src/Text';

export {FieldError} from '../src/FieldError';
export type {FieldErrorProps, FieldErrorRenderProps} from '../src/FieldError';
export type {ValidationResult} from '@react-types/shared';

export {
  Calendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarCell
} from '../src/Calendar';
export type {
  CalendarCellProps,
  CalendarProps,
  CalendarRenderProps,
  CalendarGridProps,
  CalendarGridHeaderProps,
  CalendarGridBodyProps,
  CalendarHeaderCellProps,
  CalendarCellRenderProps
} from '../src/Calendar';

export {Button} from '../src/Button';
export type {ButtonProps, ButtonRenderProps} from '../src/Button';

export {Popover} from '../src/Popover';
export type {PopoverProps, PopoverRenderProps} from '../src/Popover';
