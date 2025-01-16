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

import {CalendarDate, isWeekend} from '@internationalized/date';
import {RangeCalendar} from '../';
import React from 'react';
import {useLocale} from '@react-aria/i18n';

export default {
  title: 'RangeCalendar',
  parameters: {
    chromaticProvider: {
      locales: ['en-US'/* , 'ar-EG', 'ja-JP' */]
    }
  }
};

const value = {
  start: new CalendarDate(2022, 2, 3),
  end: new CalendarDate(2022, 2, 8)
};

export const Default = () => <RangeCalendar focusedValue={value.start} />;
export const Selected = () => <RangeCalendar value={value} />;
export const MinMax = () => (
  <RangeCalendar
    minValue={new CalendarDate(2022, 2, 10)}
    maxValue={new CalendarDate(2022, 2, 20)} />
);
export const Disabled = () => <RangeCalendar isDisabled value={value} />;
export const ReadOnly = () => <RangeCalendar isReadOnly value={value} />;
export const Unavailable = () => (
  <RangeCalendar
    focusedValue={value.start}
    isDateUnavailable={date => date.day >= 10 && date.day <= 20} />
);
export const VisibleMonths2 = () => <RangeCalendar value={value} visibleMonths={2} />;
export const VisibleMonths3 = () => <RangeCalendar value={value} visibleMonths={3} />;
export const Invalid = () => <RangeCalendar value={value} isInvalid />;
export const ErrorMessage = () => <RangeCalendar value={value} isInvalid errorMessage="Selection invalid." />;
export const UnavailableInvalid = () => <RangeCalendar value={value} isDateUnavailable={date => date.day >= 1 && date.day <= 5} />;
export const DisabledInvalid = () => <RangeCalendar value={value} minValue={new CalendarDate(2022, 2, 5)} />;
export const NonContiguous = () => {
  let {locale} = useLocale();
  return (
    <RangeCalendar
      value={{start: new CalendarDate(2022, 2, 3), end: new CalendarDate(2022, 2, 16)}}
      isDateUnavailable={date => isWeekend(date, locale)}
      allowsNonContiguousRanges />
  );
};

export const NonContiguousInvalid = () => {
  let {locale} = useLocale();
  return (
    <RangeCalendar
      value={{start: new CalendarDate(2022, 2, 3), end: new CalendarDate(2022, 2, 20)}}
      isDateUnavailable={date => isWeekend(date, locale)}
      allowsNonContiguousRanges />
  );
};

export const CustomWeekStartMonday = () => <RangeCalendar value={value} firstDayOfWeek="mon" />;
export const CustomWeekStartSaturday = () => <RangeCalendar value={value} firstDayOfWeek="sat" />;
