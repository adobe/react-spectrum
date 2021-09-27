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

import {CalendarDate, endOfMonth, isSameDay, startOfMonth, toDate} from '@internationalized/date';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDateFormatter, useMessageFormatter} from '@react-aria/i18n';
import {useMemo} from 'react';

export const calendarIds = new WeakMap<CalendarState | RangeCalendarState, string>();

export function useSelectedDateDescription(state: CalendarState | RangeCalendarState) {
  let formatMessage = useMessageFormatter(intlMessages);

  let start: CalendarDate, end: CalendarDate;
  if ('highlightedRange' in state) {
    ({start, end} = state.highlightedRange || {});
  } else {
    start = end = state.value;
  }

  let anchorDate = 'anchorDate' in state ? state.anchorDate : null;
  return useMemo(() => {
    // No message if currently selecting a range, or there is nothing highlighted.
    if (!anchorDate && start && end) {
      // Use a single date message if the start and end dates are the same day,
      // otherwise include both dates.
      if (isSameDay(start, end)) {
        return formatMessage('selectedDateDescription', {date: toDate(start, state.timeZone)});
      } else {
        return formatMessage('selectedRangeDescription', {start: toDate(start, state.timeZone), end: toDate(end, state.timeZone)});
      }
    }
    return '';
  }, [start, end, anchorDate, state.timeZone, formatMessage]);
}

export function useVisibleRangeDescription(startDate: CalendarDate, endDate: CalendarDate, timeZone: string) {
  let monthFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
    era: startDate.calendar.identifier !== 'gregory' ? 'long' : undefined,
    calendar: startDate.calendar.identifier
  });

  let dateFormatter = useDateFormatter({
    dateStyle: 'long',
    calendar: startDate.calendar.identifier
  });

  return useMemo(() => {
    // Special case for month granularity. Format as a single month if only a
    // single month is visible, otherwise format as a range of months.
    if (isSameDay(startDate, startOfMonth(startDate))) {
      if (isSameDay(endDate, endOfMonth(startDate))) {
        return monthFormatter.format(startDate.toDate(timeZone));
      } else if (isSameDay(endDate, endOfMonth(endDate))) {
        return monthFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
      }
    }

    return dateFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
  }, [startDate, endDate, monthFormatter, dateFormatter, timeZone]);
}
