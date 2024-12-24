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

import {Calendar} from '../';
import {CalendarDate} from '@internationalized/date';
import React from 'react';

export default {
  title: 'Calendar',
  parameters: {
    chromaticProvider: {
      locales: ['en-US'/* , 'ar-EG', 'ja-JP' */]
    }
  }
};

const date = new CalendarDate(2022, 2, 3);

export const Default = () => <Calendar focusedValue={date} />;
export const Selected = () => <Calendar value={date} />;
export const MinMax = () => (
  <Calendar
    minValue={new CalendarDate(2022, 2, 10)}
    maxValue={new CalendarDate(2022, 2, 20)} />
);
export const Disabled = () => <Calendar isDisabled value={date} />;
export const ReadOnly = () => <Calendar isReadOnly value={date} />;
export const Unavailable = () => (
  <Calendar
    focusedValue={date}
    isDateUnavailable={date => date.day >= 10 && date.day <= 20} />
);
export const VisibleMonths2 = () => <Calendar value={date} visibleMonths={2} />;
export const VisibleMonths3 = () => <Calendar value={date} visibleMonths={3} />;
export const Invalid = () => <Calendar value={date} isInvalid />;
export const ErrorMessage = () => <Calendar value={date} isInvalid errorMessage="Selection invalid." />;
export const UnavailableInvalid = () => <Calendar value={date} isDateUnavailable={d => d.compare(date) === 0} />;
export const DisabledInvalid = () => <Calendar value={date} minValue={new CalendarDate(2022, 2, 5)} />;
export const CustomWeekStartMonday = () => <Calendar value={date} firstDayOfWeek="mon" />;
export const CustomWeekStartSaturday = () => <Calendar value={date} firstDayOfWeek="sat" />;
