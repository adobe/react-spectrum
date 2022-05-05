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

import {CalendarDate, DateFormatter, endOfMonth, isSameDay, startOfMonth} from '@internationalized/date';
import {CalendarState, RangeCalendarState} from '@react-stately/calendar';
import {FormatMessage, useDateFormatter, useMessageFormatter} from '@react-aria/i18n';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useMemo} from 'react';

interface HookData {
  ariaLabel: string,
  ariaLabelledBy: string,
  errorMessageId: string,
  selectedDateDescription: string
}

export const hookData = new WeakMap<CalendarState | RangeCalendarState, HookData>();

export function useSelectedDateDescription(state: CalendarState | RangeCalendarState) {
  let formatMessage = useMessageFormatter(intlMessages);

  let start: CalendarDate, end: CalendarDate;
  if ('highlightedRange' in state) {
    ({start, end} = state.highlightedRange || {});
  } else {
    start = end = state.value;
  }

  let dateFormatter = useDateFormatter({
    dateStyle: 'full',
    timeZone: state.timeZone
  });

  let anchorDate = 'anchorDate' in state ? state.anchorDate : null;
  return useMemo(() => {
    // No message if currently selecting a range, or there is nothing highlighted.
    if (!anchorDate && start && end) {
      // Use a single date message if the start and end dates are the same day,
      // otherwise include both dates.
      if (isSameDay(start, end)) {
        let date = dateFormatter.format(start.toDate(state.timeZone));
        return formatMessage('selectedDateDescription', {date});
      } else {
        let dateRange = formatRange(dateFormatter, formatMessage, start, end, state.timeZone);

        return formatMessage('selectedRangeDescription', {dateRange});
      }
    }
    return '';
  }, [start, end, anchorDate, state.timeZone, formatMessage, dateFormatter]);
}

export function useVisibleRangeDescription(startDate: CalendarDate, endDate: CalendarDate, timeZone: string, isAria: boolean) {
  let formatMessage = useMessageFormatter(intlMessages);
  let monthFormatter = useDateFormatter({
    month: 'long',
    year: 'numeric',
    era: startDate.calendar.identifier !== 'gregory' ? 'long' : undefined,
    calendar: startDate.calendar.identifier,
    timeZone
  });

  let dateFormatter = useDateFormatter({
    dateStyle: 'long',
    calendar: startDate.calendar.identifier,
    timeZone
  });

  return useMemo(() => {
    // Special case for month granularity. Format as a single month if only a
    // single month is visible, otherwise format as a range of months.
    if (isSameDay(startDate, startOfMonth(startDate))) {
      if (isSameDay(endDate, endOfMonth(startDate))) {
        return monthFormatter.format(startDate.toDate(timeZone));
      } else if (isSameDay(endDate, endOfMonth(endDate))) {
        return isAria
          ? formatRange(monthFormatter, formatMessage, startDate, endDate, timeZone)
          : monthFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
      }
    }

    return isAria
      ? formatRange(dateFormatter, formatMessage, startDate, endDate, timeZone)
      : dateFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
  }, [startDate, endDate, monthFormatter, dateFormatter, formatMessage, timeZone, isAria]);
}

function formatRange(dateFormatter: DateFormatter, formatMessage: FormatMessage, start: CalendarDate, end: CalendarDate, timeZone: string) {
  let parts = dateFormatter.formatRangeToParts(start.toDate(timeZone), end.toDate(timeZone));

  // Find the separator between the start and end date. This is determined
  // by finding the last shared literal before the end range.
  let separatorIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (part.source === 'shared' && part.type === 'literal') {
      separatorIndex = i;
    } else if (part.source === 'endRange') {
      break;
    }
  }

  // Now we can combine the parts into start and end strings.
  let startValue = '';
  let endValue = '';
  for (let i = 0; i < parts.length; i++) {
    if (i < separatorIndex) {
      startValue += parts[i].value;
    } else if (i > separatorIndex) {
      endValue += parts[i].value;
    }
  }

  return formatMessage('dateRange', {startDate: startValue, endDate: endValue});
}
