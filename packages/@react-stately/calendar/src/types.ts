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

import {CalendarDate} from '@internationalized/date';
import {DateValue} from '@react-types/calendar';
import {RangeValue} from '@react-types/shared';

export interface CalendarStateBase {
  isDisabled: boolean,
  isReadOnly: boolean,
  visibleRange: RangeValue<CalendarDate>,
  timeZone: string,
  focusedDate: CalendarDate,
  setFocusedDate(value: CalendarDate): void,
  focusNextDay(): void,
  focusPreviousDay(): void,
  focusNextRow(): void,
  focusPreviousRow(): void,
  focusNextPage(): void,
  focusPreviousPage(): void,
  focusPageStart(): void,
  focusPageEnd(): void,
  focusNextSection(): void,
  focusPreviousSection(): void,
  focusNextPage(): void,
  focusPreviousPage(): void,
  selectFocusedDate(): void,
  selectDate(date: CalendarDate): void,
  isFocused: boolean,
  setFocused(value: boolean): void,
  isInvalid(date: CalendarDate): boolean,
  isSelected(date: CalendarDate): boolean,
  isCellFocused(date: CalendarDate): boolean,
  isCellDisabled(date: CalendarDate): boolean,
  isPreviousVisibleRangeInvalid(): boolean,
  isNextVisibleRangeInvalid(): boolean
}

export interface CalendarState extends CalendarStateBase {
  value: CalendarDate,
  setValue(value: CalendarDate): void
}

export interface RangeCalendarState extends CalendarStateBase {
  value: RangeValue<DateValue>,
  setValue(value: RangeValue<DateValue>): void,
  highlightDate(date: CalendarDate): void,
  anchorDate: CalendarDate | null,
  setAnchorDate(date: CalendarDate | null): void,
  highlightedRange: RangeValue<CalendarDate>,
  isDragging: boolean,
  setDragging(isDragging: boolean): void
}
