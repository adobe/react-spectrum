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
import {CalendarDate, parseDate, toZoned} from '@internationalized/date';
import {DateRangePicker} from '../';
import React from 'react';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

export default {
  title: 'Date and Time/DateRangePicker',
  decorators: [BlockDecorator]
};

export const Default = () => render();

Default.story = {
  name: 'default'
};

export const DefaultValue = () => render({defaultValue: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

DefaultValue.story = {
  name: 'defaultValue'
};

export const ControlledValue = () => render({value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

ControlledValue.story = {
  name: 'controlled value'
};

export const DefaultValueZoned = () => render({defaultValue: {start: toZoned(parseDate('2020-02-03'), 'America/New_York'), end: toZoned(parseDate('2020-02-05'), 'America/Los_Angeles')}});

DefaultValueZoned.story = {
  name: 'defaultValue, zoned'
};

export const GranularityMinute = () => render({granularity: 'minute'});

GranularityMinute.story = {
  name: 'granularity: minute'
};

export const GranularitySecond = () => render({granularity: 'second'});

GranularitySecond.story = {
  name: 'granularity: second'
};

export const HourCycle12 = () => render({granularity: 'minute', hourCycle: 12});

HourCycle12.story = {
  name: 'hourCycle: 12'
};

export const HourCycle24 = () => render({granularity: 'minute', hourCycle: 24});

HourCycle24.story = {
  name: 'hourCycle: 24'
};

export const IsDisabled = () => render({isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

IsDisabled.story = {
  name: 'isDisabled'
};

export const IsQuietIsDisabled = () => render({isQuiet: true, isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

IsQuietIsDisabled.story = {
  name: 'isQuiet, isDisabled'
};

export const IsReadOnly = () => render({isReadOnly: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

IsReadOnly.story = {
  name: 'isReadOnly'
};

export const AutoFocus = () => render({autoFocus: true});

AutoFocus.story = {
  name: 'autoFocus'
};

export const ValidationStateInvalid = () => render({validationState: 'invalid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

ValidationStateInvalid.story = {
  name: 'validationState: invalid'
};

export const ValidationStateValid = () => render({validationState: 'valid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}});

ValidationStateValid.story = {
  name: 'validationState: valid'
};

export const MinDate201011MaxDate202011 = () => render({minValue: new CalendarDate(2010, 1, 1), maxValue: new CalendarDate(2020, 1, 1)});

MinDate201011MaxDate202011.story = {
  name: 'minDate: 2010/1/1, maxDate: 2020/1/1'
};

export const PlaceholderValue198011 = () => render({placeholderValue: new CalendarDate(1980, 1, 1)});

PlaceholderValue198011.story = {
  name: 'placeholderValue: 1980/1/1'
};

export const VisibleMonths2 = () => render({visibleMonths: 2, granularity: 'minute'});

VisibleMonths2.story = {
  name: 'visibleMonths: 2'
};

export const VisibleMonths3 = () => render({visibleMonths: 3, granularity: 'minute'});

VisibleMonths3.story = {
  name: 'visibleMonths: 3'
};

export function render(props = {}) {
  return (
    <div>
      <DateRangePicker
        label="Date range"
        onChange={action('change')}
        {...props} />
    </div>
  );
}
