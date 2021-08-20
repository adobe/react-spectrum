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
import {storiesOf} from '@storybook/react';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf('Date and Time/DateRangePicker', module)
  .addDecorator(BlockDecorator)
  .add(
    'default',
    () => render()
  )
  .add(
    'defaultValue',
    () => render({defaultValue: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'controlled value',
    () => render({value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'defaultValue, zoned',
    () => render({defaultValue: {start: toZoned(parseDate('2020-02-03'), 'America/New_York'), end: toZoned(parseDate('2020-02-05'), 'America/Los_Angeles')}})
  )
  .add(
    'granularity: minute',
    () => render({granularity: 'minute'})
  )
  .add(
    'hourCycle: 12',
    () => render({granularity: 'minute', hourCycle: 12})
  )
  .add(
    'hourCycle: 24',
    () => render({granularity: 'minute', hourCycle: 24})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({isQuiet: true, isDisabled: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', value: {start: new CalendarDate(2020, 2, 3), end: new CalendarDate(2020, 5, 4)}})
  )
  .add(
    'minDate: 2010/1/1, maxDate: 2020/1/1',
    () => render({minValue: new CalendarDate(2010, 1, 1), maxValue: new CalendarDate(2020, 1, 1)})
  )
  .add(
    'placeholderValue: 1980/1/1',
    () => render({placeholderValue: new CalendarDate(1980, 1, 1)})
  );

storiesOf('Date and Time/DateRangePicker/styling', module)
  .addDecorator(BlockDecorator)
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'labelAlign: end',
    () => render({labelPosition: 'top', labelAlign: 'end'})
  )
  .add(
    'required',
    () => render({isRequired: true})
  )
  .add(
    'required with label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'optional',
    () => render({necessityIndicator: 'label'})
  )
  .add(
    'no visible label',
    () => render({'aria-label': 'Date range', label: null})
  )
  .add(
    'quiet no visible label',
    () => render({isQuiet: true, 'aria-label': 'Date range', label: null})
  )
  .add(
    'custom width',
    () => render({width: 'size-3600'})
  )
  .add(
    'quiet custom width',
    () => render({isQuiet: true, width: 'size-3600'})
  )
  .add(
    'custom width no visible label',
    () => render({width: 'size-3600', label: null, 'aria-label': 'Date range'})
  )
  .add(
    'custom width, labelPosition=side',
    () => render({width: 'size-3600', labelPosition: 'side'})
  );

function render(props = {}) {
  return (
    <div>
      <DateRangePicker
        label="Date range"
        onChange={action('change')}
        {...props} />
    </div>
  );
}
