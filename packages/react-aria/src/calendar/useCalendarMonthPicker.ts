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

import {CalendarDate} from '@internationalized/date';
import {CalendarSelectionMode, CalendarState} from 'react-stately/useCalendarState';
import {Key} from '@react-types/shared';
import {RangeCalendarState} from 'react-stately/useRangeCalendarState';
import {useDateFormatter} from '../i18n/useDateFormatter';
import {useLocale} from '../i18n/I18nProvider';
import {useMemo} from 'react';

export interface CalendarMonthPickerProps {
  /**
   * The format of the month.
   */
  format?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
}

export interface CalendarMonthPickerAria {
  'aria-label': string;
  value: Key;
  onChange: (key: Key | null) => void;
  items: CalendarMonthPickerItem[];
}

export interface CalendarMonthPickerItem {
  id: number;
  date: CalendarDate;
  formatted: string;
}

export function useCalendarMonthPicker(
  props: CalendarMonthPickerProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): CalendarMonthPickerAria {
  let formatter = useDateFormatter({
    month: props.format || 'short',
    calendar: state.focusedDate.calendar.identifier,
    timeZone: state.timeZone
  });

  // Format the name of each month in the year according to the
  // current locale and calendar system. Note that in some calendar
  // systems, such as the Hebrew, the number of months may differ
  // between years.
  let months: CalendarMonthPickerItem[] = [];
  let numMonths = state.focusedDate.calendar.getMonthsInYear(state.focusedDate);
  for (let i = 1; i <= numMonths; i++) {
    let date = state.focusedDate.set({month: i});
    months.push({
      id: i,
      date,
      formatted: formatter.format(date.toDate(state.timeZone))
    });
  }

  let {locale} = useLocale();
  let ariaLabel = useMemo(
    () => new Intl.DisplayNames(locale, {type: 'dateTimeField'}).of('month')!,
    [locale]
  );

  return {
    'aria-label': ariaLabel,
    value: state.focusedDate.month,
    onChange: key => {
      if (key != null) {
        state.setFocusedDate(months[Number(key) - 1].date);
      }
    },
    items: months
  };
}
