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

import {action} from '@storybook/addon-actions';
import {CalendarDate, CalendarDateTime, getLocalTimeZone, parseZonedDateTime, today} from '@internationalized/date';
import {Flex} from '@react-spectrum/layout';
import {RangeCalendar} from '../';
import React, {useState} from 'react';
import {TimeField} from '@react-spectrum/datepicker';

export default {
  title: 'Date and Time/RangeCalendar'
};

export const Default = () => render();
export const DefaultValue = () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}});

DefaultValue.story = {
  name: 'defaultValue'
};

export const ControlledValue = () => render({value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}});

ControlledValue.story = {
  name: 'controlled value'
};

export const WithTime = () => <RangeCalendarWithTime />;

WithTime.story = {
  name: 'with time'
};

export const WithZonedTime = () => <RangeCalendarWithZonedTime />;

WithZonedTime.story = {
  name: 'with zoned time'
};

export const MinValueTodayMaxValue1WeekFromNow = () => render({minValue: today(getLocalTimeZone()), maxValue: today(getLocalTimeZone()).add({weeks: 1})});

MinValueTodayMaxValue1WeekFromNow.story = {
  name: 'minValue: today, maxValue: 1 week from now'
};

export const DefaultValueMinValueMaxValue = () => render({defaultValue: {start: new CalendarDate(2019, 6, 10), end: new CalendarDate(2019, 6, 12)}, minValue: new CalendarDate(2019, 6, 5), maxValue: new CalendarDate(2019, 6, 20)});

DefaultValueMinValueMaxValue.story = {
  name: 'defaultValue + minValue + maxValue'
};

export const IsDisabled = () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}, isDisabled: true});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsReadOnly = () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}, isReadOnly: true});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const AutoFocus = () => render({defaultValue: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 6, 10)}, autoFocus: true});

AutoFocus.story = {
  name: 'autoFocus'
};

export const VisibleMonths2 = () => render({visibleMonths: 2});

VisibleMonths2.story = {
  name: 'visibleMonths: 2'
};

export const VisibleMonths3 = () => render({visibleMonths: 3});

VisibleMonths3.story = {
  name: 'visibleMonths: 3'
};

export const MinValueTodayVisibleMonths3 = () => render({minValue: today(getLocalTimeZone()), visibleMonths: 3});

MinValueTodayVisibleMonths3.story = {
  name: 'minValue: today, visibleMonths: 3'
};

export const DefaultValueVisibleMonths3 = () => render({visibleMonths: 3, defaultValue: {start: new CalendarDate(2021, 10, 5), end: new CalendarDate(2021, 12, 10)}});

DefaultValueVisibleMonths3.story = {
  name: 'defaultValue, visibleMonths: 3'
};

function render(props = {}) {
  return <RangeCalendar onChange={action('change')} {...props} />;
}

function RangeCalendarWithTime() {
  let [value, setValue] = useState({start: new CalendarDateTime(2019, 6, 5, 8), end: new CalendarDateTime(2019, 6, 10, 12)});

  return (
    <Flex direction="column">
      <RangeCalendar value={value} onChange={setValue} />
      <Flex gap="size-100">
        <TimeField label="Start time" value={value.start} onChange={v => setValue({...value, start: v})} />
        <TimeField label="End time" value={value.end} onChange={v => setValue({...value, end: v})} />
      </Flex>
    </Flex>
  );
}

function RangeCalendarWithZonedTime() {
  let [value, setValue] = useState({start: parseZonedDateTime('2021-03-10T00:45-05:00[America/New_York]'), end: parseZonedDateTime('2021-03-26T18:05-07:00[America/Los_Angeles]')});

  return (
    <Flex direction="column">
      <RangeCalendar value={value} onChange={setValue} />
      <Flex gap="size-100">
        <TimeField label="Start time" value={value.start} onChange={v => setValue({...value, start: v})} />
        <TimeField label="End time" value={value.end} onChange={v => setValue({...value, end: v})} />
      </Flex>
    </Flex>
  );
}
