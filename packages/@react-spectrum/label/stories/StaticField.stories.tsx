
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

import {CalendarDate, CalendarDateTime, Time, ZonedDateTime} from '@internationalized/date';
import React from 'react';
import {StaticField} from '../src/StaticField';
import {storiesOf} from '@storybook/react';

storiesOf('StaticField', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render()
  )
  .add(
    'CalendarDate',
    () => render({value: new CalendarDate(2019, 6, 5), formatOptions: 'dateStyle'})
  )
  .add(
    'RangeValue<Date>',
    () => render({value: {start: new Date(2019, 6, 5), end: new Date(2019, 6, 10)}})
  )
  .add(
    'RangeValue<ZonedDateTime>',
    () => render({value: {start: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), end: new ZonedDateTime(2020, 3, 3, 'America/Los_Angeles', -28800000)}})
  )
  .add(
    'RangeValue<Time>',
    () => render({value: {start: new Time(9, 45), end: new Time(10, 50)}, formatOptions: {timeStyle: 'medium'}})
  )
  .add(
    'RangeValue<CalendarDateTime>',
    () => render({value: {start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120)}, formatOptions: {timeStyle: 'medium'}})
  )
  .add(
    'RangeValue<CalendarTime>',
    () => render({value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}, formatOptions: {dateStyle: 'long'}})
  )
  .add(
    'ZonedDateTime',
    () => render({value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}})
  )
  .add(
    'CalendarDateTime',
    () => render({value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}})
  )
  .add(
    'Date',
    () => render({value: new Date(2000, 5, 5), formatOptions: {dateStyle: 'medium'}})
  )
  .add(
    'Time',
    () => render({value: new Time(9, 45), formatOptions: {timeStyle: 'long'}})
  )
  .add(
    'RangeValue<NumberValue>',
    () => render({value: {start: 10, end: 20}})
  )
  .add(
    'number',
    () => render({value: 10})
  )
  .add(
    'with no visible label',
    () => render({value: 10, label: null, 'aria-label': 'label'})
  )
  .add(
    'labelPosition: side',
    () => render({value: 10, labelPosition: 'side'})
  )
  .add(
    'labelAlign: end>',
    () => render({value: {start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120)}, formatOptions: {timeStyle: 'medium'}, labelAlign: 'end'})
  );

function render(props = {}) {
  return (
    <StaticField
      value="test"
      label="Display StaticField"
      {...props} />
  );
}

