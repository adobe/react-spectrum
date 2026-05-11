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

import {CalendarDate, isSameYear, toCalendarDate} from '@internationalized/date';
import {CalendarSelectionMode, CalendarState} from 'react-stately/useCalendarState';
import {Key} from '@react-types/shared';
import {RangeCalendarState} from 'react-stately/useRangeCalendarState';
import {useDateFormatter} from '../i18n/useDateFormatter';
import {useLocale} from '../i18n/I18nProvider';
import {useMemo} from 'react';

export interface CalendarYearPickerFormatOptions {
  year?: 'numeric' | '2-digit';
  era?: 'long' | 'short' | 'narrow';
}

export interface CalendarYearPickerProps {
  /**
   * The number of years to display.
   * @default 20
   */
  visibleYears?: number;
  /**
   * The format to display.
   */
  format?: CalendarYearPickerFormatOptions;
}

export interface CalendarYearPickerAria {
  'aria-label': string;
  value: Key;
  onChange: (key: Key | null) => void;
  items: CalendarYearPickerItem[];
}

export interface CalendarYearPickerItem {
  id: number;
  date: CalendarDate;
  formatted: string;
}

export function useCalendarYearPicker(
  props: CalendarYearPickerProps,
  state: CalendarState<CalendarSelectionMode> | RangeCalendarState
): CalendarYearPickerAria {
  let formatter = useDateFormatter({
    year: props.format?.year || 'numeric',
    era:
      props.format?.era ||
      (state.focusedDate.calendar.identifier === 'gregory' && state.focusedDate.era === 'BC'
        ? 'short'
        : undefined),
    calendar: state.focusedDate.calendar.identifier,
    timeZone: state.timeZone
  });

  // Determine the minimum and maximum date. By default, show an equal number of years on each side of the current year.
  // However, this can be constrained by the calendar's minimum and maximum date.
  let visibleYears = props.visibleYears || 20;
  let minDate = state.focusedDate.subtract({years: Math.floor(visibleYears / 2)});
  let maxDate = state.focusedDate.add({years: Math.ceil(visibleYears / 2)});
  if (state.maxValue && maxDate.compare(state.maxValue) > 0) {
    maxDate = toCalendarDate(state.maxValue);
    minDate = maxDate.subtract({years: visibleYears});
  }

  if (state.minValue && minDate.compare(state.minValue) < 0) {
    minDate = toCalendarDate(state.minValue);
    maxDate = minDate.add({years: visibleYears});
    if (state.maxValue && maxDate.compare(state.maxValue) > 0) {
      maxDate = toCalendarDate(state.maxValue);
    }
  }

  let years: CalendarYearPickerItem[] = [];
  let date = minDate;
  let value = 0;
  while (date.compare(maxDate) < 0) {
    if (isSameYear(date, state.focusedDate)) {
      value = years.length;
    }

    years.push({
      // Use the index as the id so we can retrieve the full
      // date object from the list in onChange. We cannot only
      // store the year number, because in some calendars, such
      // as the Japanese, the era may also change.
      id: years.length,
      date,
      formatted: formatter.format(date.toDate(state.timeZone))
    });

    date = date.add({years: 1});
  }

  let {locale} = useLocale();
  let ariaLabel = useMemo(
    () => new Intl.DisplayNames(locale, {type: 'dateTimeField'}).of('year')!,
    [locale]
  );

  return {
    'aria-label': ariaLabel,
    value,
    onChange: key => {
      if (key != null) {
        state.setFocusedDate(years[key].date);
      }
    },
    items: years
  };
}
