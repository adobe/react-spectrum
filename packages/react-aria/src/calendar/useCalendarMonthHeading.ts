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

import {CalendarSelectionMode, CalendarState} from 'react-stately/useCalendarState';
import {RangeCalendarState} from 'react-stately/useRangeCalendarState';
import {useDateFormatter} from '../i18n/useDateFormatter';

export interface CalendarMonthHeadingFormatOptions {
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow',
  year?: 'numeric' | '2-digit',
  era?: 'long' | 'short' | 'narrow'
}

export interface CalendarMonthHeadingProps {
  /**
   * The number of months from the start of the visible range to display.
   * @default 0
   */
  offset?: number,
  /**
   * The format of the month heading.
   */
  format?: CalendarMonthHeadingFormatOptions
}

export function useCalendarMonthHeading(props: CalendarMonthHeadingProps, state: CalendarState<CalendarSelectionMode> | RangeCalendarState): string {
  let currentMonth = state.visibleRange.start.add({months: props.offset || 0});
  let formatter = useDateFormatter({
    month: props.format?.month || 'long',
    year: props.format?.year || 'numeric',
    era: props.format?.era || currentMonth && currentMonth.calendar.identifier === 'gregory' && currentMonth.era === 'BC' ? 'short' : undefined,
    calendar: state.visibleRange?.start.calendar.identifier,
    timeZone: state.timeZone
  });

  return formatter.format(currentMonth.toDate(state.timeZone));
}
