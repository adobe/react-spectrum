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
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

export default {
  title: 'Calendar',
  parameters: {
    chromaticProvider: {
      locales: ['en-US'/* , 'ar-EG', 'ja-JP' */]
    }
  }
} as Meta<typeof Calendar>;

export type CalendarStory = StoryFn<typeof Calendar>;

const date = new CalendarDate(2022, 2, 3);

export const Default: CalendarStory = () => <Calendar focusedValue={date} />;
export const Selected: CalendarStory = () => <Calendar value={date} />;
export const MinMax: CalendarStory = () => (
  <Calendar
    minValue={new CalendarDate(2022, 2, 10)}
    maxValue={new CalendarDate(2022, 2, 20)} />
);
export const Disabled: CalendarStory = () => <Calendar isDisabled value={date} />;
export const ReadOnly: CalendarStory = () => <Calendar isReadOnly value={date} />;
export const Unavailable: CalendarStory = () => (
  <Calendar
    focusedValue={date}
    isDateUnavailable={date => date.day >= 10 && date.day <= 20} />
);
export const VisibleMonths2: CalendarStory = () => <Calendar value={date} visibleMonths={2} />;
export const VisibleMonths3: CalendarStory = () => <Calendar value={date} visibleMonths={3} />;
export const Invalid: CalendarStory = () => <Calendar value={date} isInvalid />;
export const ErrorMessage: CalendarStory = () => <Calendar value={date} isInvalid errorMessage="Selection invalid." />;
export const UnavailableInvalid: CalendarStory = () => <Calendar value={date} isDateUnavailable={d => d.compare(date) === 0} />;
export const DisabledInvalid: CalendarStory = () => <Calendar value={date} minValue={new CalendarDate(2022, 2, 5)} />;
export const CustomWeekStartMonday: CalendarStory = () => <Calendar value={date} firstDayOfWeek="mon" />;
export const CustomWeekStartSaturday: CalendarStory = () => <Calendar value={date} firstDayOfWeek="sat" />;
