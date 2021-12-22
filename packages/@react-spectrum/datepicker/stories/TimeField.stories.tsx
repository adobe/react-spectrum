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
import {CalendarDateTime, parseTime, parseZonedDateTime, Time, toZoned} from '@internationalized/date';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TimeField} from '../';

const BlockDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf('Date and Time/TimeField', module)
  .addDecorator(BlockDecorator)
  .add(
    'default',
    () => render()
  )
  .add(
    'defaultValue',
    () => render({defaultValue: parseTime('20:24')})
  )
  .add(
    'controlled value',
    () => render({value: new Time(2, 35)})
  )
  .add(
    'granularity: second',
    () => render({granularity: 'second'})
  )
  .add(
    'hourCycle: 12',
    () => render({hourCycle: 12, defaultValue: parseTime('00:00')})
  )
  .add(
    'hourCycle: 24',
    () => render({hourCycle: 24, defaultValue: parseTime('00:00')})
  )
  .add(
    'hourCycle: 12, granularity: hour',
    () => render({hourCycle: 12, granularity: 'hour'})
  )
  .add(
    'hourCycle: 24, granularity: hour',
    () => render({hourCycle: 24, granularity: 'hour'})
  )
  .add(
    'zoned',
    () => render({defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]')})
  )
  .add(
    'hideTimeZone',
    () => render({defaultValue: parseZonedDateTime('2021-11-07T00:45-07:00[America/Los_Angeles]'), hideTimeZone: true})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true, value: new Time(2, 35)})
  )
  .add(
    'isQuiet, isDisabled',
    () => render({isQuiet: true, isDisabled: true, value: new Time(2, 35)})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true, value: new Time(2, 35)})
  )
  .add(
    'autoFocus',
    () => render({autoFocus: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid', value: new Time(2, 35)})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', value: new Time(2, 35)})
  )
  .add(
    'placeholderValue: 8 AM',
    () => render({placeholderValue: new Time(8)})
  )
  .add(
    'placeholderValue: 1980/1/1 8AM, zoned',
    () => render({placeholderValue: toZoned(new CalendarDateTime(1980, 1, 1, 8), 'America/Los_Angeles')})
  )
  .add(
    'minValue: 8 AM',
    () => render({minValue: new Time(8)})
  )
  .add(
    'maxValue: 8 PM',
    () => render({maxValue: new Time(20)})
  )
  .add(
    'minValue: 8 AM, maxValue: 8 PM',
    () => render({minValue: new Time(8), maxValue: new Time(20)})
  );

storiesOf('Date and Time/TimeField/styling', module)
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
    () => render({'aria-label': 'Time', label: null})
  )
  .add(
    'quiet no visible label',
    () => render({isQuiet: true, 'aria-label': 'Time', label: null})
  )
  .add(
    'custom width',
    () => render({width: 'size-3000'})
  )
  .add(
    'quiet custom width',
    () => render({isQuiet: true, width: 'size-3000'})
  )
  .add(
    'custom width no visible label',
    () => render({width: 'size-3000', label: null, 'aria-label': 'Time'})
  )
  .add(
    'custom width, labelPosition=side',
    () => render({width: 'size-3000', labelPosition: 'side'})
  );

function render(props = {}) {
  return (
    <TimeField
      label="Time"
      onChange={action('change')}
      maxWidth="calc(100vw - 40px)"
      {...props} />
  );
}
