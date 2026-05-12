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
import {DateDuration} from '@internationalized/date';
import {RangeCalendarState} from 'react-stately/useRangeCalendarState';
import {useDateFormatter} from '../i18n/useDateFormatter';
import {useMemo} from 'react';

export interface CalendarHeadingFormatOptions {
  day?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  era?: 'long' | 'short' | 'narrow';
}

export interface CalendarHeadingProps {
  /**
   * The number of months from the start of the visible range to display.
   *
   * @default 0
   */
  offset?: DateDuration;
  /**
   * The format of the month heading.
   */
  format?: CalendarHeadingFormatOptions;
}

export function useCalendarHeading(
  props: CalendarHeadingProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): string {
  let startDate = useMemo(() => {
    let currentMonth = state.visibleRange.start;
    if (props.offset) {
      currentMonth = currentMonth.add(props.offset);
    }
    return currentMonth;
  }, [state.visibleRange.start, props.offset]);

  let isDays = state.visibleDuration.days || state.visibleDuration.weeks;
  let formatter = useDateFormatter({
    day: props.format?.day || (isDays ? 'numeric' : undefined),
    month: props.format?.month || 'long',
    year: props.format?.year || 'numeric',
    era:
      props.format?.era ||
      (startDate && startDate.calendar.identifier === 'gregory' && startDate.era === 'BC')
        ? 'short'
        : undefined,
    calendar: state.visibleRange?.start.calendar.identifier,
    timeZone: state.timeZone
  });

  return useMemo(() => {
    if (isDays) {
      return formatter.formatRange(
        startDate.toDate(state.timeZone),
        state.visibleRange.end.toDate(state.timeZone)
      );
    }

    return formatter.format(startDate.toDate(state.timeZone));
  }, [formatter, isDays, startDate, state.timeZone, state.visibleRange.end]);
}
