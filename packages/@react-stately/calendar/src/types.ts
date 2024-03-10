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
import {RangeValue, ValidationState} from '@react-types/shared';

interface CalendarStateBase {
  /** Whether the calendar is disabled. */
  readonly isDisabled: boolean,
  /** Whether the calendar is in a read only state. */
  readonly isReadOnly: boolean,
  /** The date range that is currently visible in the calendar. */
  readonly visibleRange: RangeValue<CalendarDate>,
  /** The minimum allowed date that a user may select. */
  readonly minValue?: DateValue,
  /** The maximum allowed date that a user may select. */
  readonly maxValue?: DateValue,
  /** The time zone of the dates currently being displayed. */
  readonly timeZone: string,
  /**
   * The current validation state of the selected value.
   * @deprecated Use `isValueInvalid` instead.
   */
  readonly validationState: ValidationState,
  /** Whether the calendar is invalid. */
  readonly isValueInvalid: boolean,
  /** The currently focused date. */
  readonly focusedDate: CalendarDate,
  /** Sets the focused date. */
  setFocusedDate(value: CalendarDate): void,
  /** Moves focus to the next calendar date. */
  focusNextDay(): void,
  /** Moves focus to the previous calendar date. */
  focusPreviousDay(): void,
  /** Moves focus to the next row of dates, e.g. the next week. */
  focusNextRow(): void,
  /** Moves focus to the previous row of dates, e.g. the previous work. */
  focusPreviousRow(): void,
  /** Moves focus to the next page of dates, e.g. the next month if one month is visible. */
  focusNextPage(): void,
  /** Moves focus to the previous page of dates, e.g. the previous month if one month is visible. */
  focusPreviousPage(): void,
  /** Moves focus to the start of the current section of dates, e.g. the start of the current month. */
  focusSectionStart(): void,
  /** Moves focus to the end of the current section of dates, e.g. the end of the current month month. */
  focusSectionEnd(): void,
  /**
   * Moves focus to the next section of dates based on what is currently displayed.
   * By default, focus is moved by one of the currently displayed unit. For example, if
   * one or more months are displayed, then focus is moved forward by one month.
   * If the `larger` option is `true`, the focus is moved by the next larger unit than
   * the one displayed. For example, if months are displayed, then focus moves to the next year.
   */
  focusNextSection(larger?: boolean): void,
  /**
   * Moves focus to the previous section of dates based on what is currently displayed.
   * By default, focus is moved by one of the currently displayed unit. For example, if
   * one or more months are displayed, then focus is moved backward by one month.
   * If the `larger` option is `true`, the focus is moved by the next larger unit than
   * the one displayed. For example, if months are displayed, then focus moves to the previous year.
   */
  focusPreviousSection(larger?: boolean): void,
  /** Selects the currently focused date. */
  selectFocusedDate(): void,
  /** Selects the given date. */
  selectDate(date: CalendarDate): void,
  /** Whether focus is currently within the calendar. */
  readonly isFocused: boolean,
  /** Sets whether focus is currently within the calendar. */
  setFocused(value: boolean): void,
  /** Returns whether the given date is invalid according to the `minValue` and `maxValue` props. */
  isInvalid(date: CalendarDate): boolean,
  /** Returns whether the given date is currently selected. */
  isSelected(date: CalendarDate): boolean,
  /** Returns whether the given date is currently focused. */
  isCellFocused(date: CalendarDate): boolean,
  /** Returns whether the given date is disabled according to the `minValue, `maxValue`, and `isDisabled` props. */
  isCellDisabled(date: CalendarDate): boolean,
  /** Returns whether the given date is unavailable according to the `isDateUnavailable` prop. */
  isCellUnavailable(date: CalendarDate): boolean,
  /** Returns whether the previous visible date range is allowed to be selected according to the `minValue` prop. */
  isPreviousVisibleRangeInvalid(): boolean,
  /** Returns whether the next visible date range is allowed to be selected according to the `maxValue` prop. */
  isNextVisibleRangeInvalid(): boolean,
  /**
   * Returns an array of dates in the week index counted from the provided start date, or the first visible date if not given.
   * The returned array always has 7 elements, but may include null if the date does not exist according to the calendar system.
   */
  getDatesInWeek(weekIndex: number, startDate?: CalendarDate): Array<CalendarDate | null>
}

export interface CalendarState extends CalendarStateBase {
  /** The currently selected date. */
  readonly value: CalendarDate | null,
  /** Sets the currently selected date. */
  setValue(value: CalendarDate | null): void
}

export interface RangeCalendarState extends CalendarStateBase {
  /** The currently selected date range. */
  readonly value: RangeValue<DateValue>,
  /** Sets the currently selected date range. */
  setValue(value: RangeValue<DateValue>): void,
  /** Highlights the given date during selection, e.g. by hovering or dragging. */
  highlightDate(date: CalendarDate): void,
  /** The current anchor date that the user clicked on to begin range selection. */
  readonly anchorDate: CalendarDate | null,
  /** Sets the anchor date that the user clicked on to begin range selection. */
  setAnchorDate(date: CalendarDate | null): void,
  /** The currently highlighted date range. */
  readonly highlightedRange: RangeValue<CalendarDate>,
  /** Whether the user is currently dragging over the calendar. */
  readonly isDragging: boolean,
  /** Sets whether the user is dragging over the calendar. */
  setDragging(isDragging: boolean): void
}
