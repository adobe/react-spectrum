
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

const parameters = {
  args: {
    labelPosition: 'top',
    labelAlign: 'start',
    label: 'Test',
    width: null
  },
  argTypes: {
    labelPosition: {
      control: {
        type: 'radio',
        options: ['top', 'side']
      }
    },
    labelAlign: {
      control: {
        type: 'radio',
        options: ['start', 'end']
      }
    },
    label: {
      control: {
        type: 'radio',
        options: ['Test', null]
      }
    },
    width: {
      control: {
        type: 'radio',
        options: [null, '300px', '600px']
      }
    }
  }
};

storiesOf('StaticField', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'string',
    (args) => (
      <StaticField
        value="test"
        width="300px"
        label="Display StaticField"
        {...args} />
    ), parameters
  )
  .add(
    'long string',
    (args) => (
      <StaticField
        value={'foo '.repeat(100)}
        label="Display StaticField"
        {...args} />
    ), parameters
  )
  .add(
    'string array',
    (args) => (
      <StaticField
        value={['wow', 'cool', 'awesome']}
        label="Display StaticField"
        {...args} />
    ), parameters
  )
  .add(
    'CalendarDate',
    (args) => (
      <StaticField
        value={new CalendarDate(2019, 6, 5)}
        label="Display StaticField"
        formatOptions={{dateStyle: 'medium'}}
        {...args} />
    ), parameters
  )
  .add(
    'RangeValue<Date>',
    (args) => (
      <StaticField
        value={{start: new Date(2019, 6, 5), end: new Date(2019, 6, 10)}}
        label="Display StaticField"
        {...args} />
    ), parameters
  )
  .add(
    'RangeValue<ZonedDateTime>',
    (args) => (
      <StaticField
        value={{start: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), end: new ZonedDateTime(2020, 3, 3, 'America/Los_Angeles', -28800000)}}
        formatOptions={{dateStyle: 'medium', timeStyle: 'medium'}}
        label="Display StaticField"
        {...args} />
    ), parameters
  )
  .add(
    'RangeValue<Time>',
    (args) => (
      <StaticField
        value={{start: new Time(9, 45), end: new Time(10, 50)}}
        label="Display StaticField"
        formatOptions={{timeStyle: 'medium'}}
        {...args} />
    ), parameters
  )
  .add(
    'RangeValue<CalendarDateTime>',
    (args) => (
      <StaticField
        value={{start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120)}}
        label="Display StaticField"
        formatOptions={{timeStyle: 'medium'}}
        {...args} />
    ), parameters
  )
  .add(
    'RangeValue<CalendarTime>',
    (args) => (
      <StaticField
        value={{start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}}
        label="Display StaticField"
        formatOptions={{dateStyle: 'long'}}
        {...args} />
    ), parameters
  )
  .add(
    'ZonedDateTime',
    (args) => (
      <StaticField
        value={new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000)}
        label="Display StaticField"
        formatOptions={{dateStyle: 'medium', timeStyle: 'medium'}}
        {...args} />
    ), parameters
  )
  .add(
    'CalendarDateTime',
    (args) => (
      <StaticField
        value={new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120)}
        label="Display StaticField"
        formatOptions={{dateStyle: 'medium', timeStyle: 'medium'}}
        {...args} />
    ), parameters
  )
  .add(
    'Date',
    (args) => (
      <StaticField
        value={new Date(2000, 5, 5)}
        label="Display StaticField"
        formatOptions={{dateStyle: 'medium'}}
        {...args} />
    ), parameters
  )
  .add(
    'Time',
    (args) => (
      <StaticField
        value={new Time(9, 45)}
        label="Display StaticField"
        formatOptions={{dateStyle: 'long'}}
        {...args} />
    ), parameters
  )
  .add(
    'RangeValue<NumberValue>',
    (args) => (
      <StaticField
        value={{start: 10, end: 20}}
        label="Display StaticField"
        {...args} />
    ), parameters
  )
  .add(
    'number',
    (args) => (
      <StaticField
        value={10}
        label="Display StaticField"
        {...args} />
    ), parameters
  );
