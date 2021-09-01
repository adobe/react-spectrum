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

import {CalendarAria} from './types';
import {DateValue, RangeCalendarProps} from '@react-types/calendar';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {isSameDay} from '@internationalized/date';
import {mergeProps} from '@react-aria/utils';
import {RangeCalendarState} from '@react-stately/calendar';
import {useCalendarBase} from './useCalendarBase';
import {useMemo} from 'react';
import {useMessageFormatter} from '@react-aria/i18n';

export function useRangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, state: RangeCalendarState): CalendarAria {
  // Compute localized message for the selected date or range
  let formatMessage = useMessageFormatter(intlMessages);
  let {start, end} = state.highlightedRange || {start: null, end: null};
  let selectedDateDescription = useMemo(() => {
    // No message if currently selecting a range, or there is nothing highlighted.
    if (!state.anchorDate && start && end) {
      // Use a single date message if the start and end dates are the same day,
      // otherwise include both dates.
      if (isSameDay(start, end)) {
        return formatMessage('selectedDateDescription', {date: start.toDate(state.timeZone)});
      } else {
        return formatMessage('selectedRangeDescription', {start: start.toDate(state.timeZone), end: end.toDate(state.timeZone)});
      }
    }
    return '';
  }, [start, end, state.anchorDate, state.timeZone, formatMessage]);

  let onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        // Cancel the selection.
        state.setAnchorDate(null);
        break;
    }
  };

  let res = useCalendarBase(props, state, selectedDateDescription);
  res.calendarBodyProps = mergeProps(res.calendarBodyProps, {
    'aria-multiselectable': true,
    onKeyDown
  });

  return res;
}
