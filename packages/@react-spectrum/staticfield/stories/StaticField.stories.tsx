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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {StaticField} from '../';

type StaticFieldStory = ComponentStoryObj<typeof StaticField>;

export default {
  title: 'StaticField',
  component: StaticField,
  argTypes: {
    labelPosition: {
      control: {
        type: 'radio',
        options: [null, 'top', 'side']
      }
    },
    labelAlign: {
      control: {
        type: 'radio',
        options: ['start', 'end']
      }
    },
    width: {
      control: {
        type: 'radio',
        options: [null, '300px', '600px']
      }
    }
  }
} as ComponentMeta<typeof StaticField>;

export let Default: StaticFieldStory = {
  args: {label: 'Test', value: 'foo '.repeat(20)},
  name: 'String'
};

export let StringArray: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: ['wow', 'cool', 'awesome']},
  name: 'String array'
};

export let CalendarDateType: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: new CalendarDate(2019, 6, 5), formatOptions: {dateStyle: 'medium'}},
  name: 'CalendarDate'
};

export let CalendarDateTimeType: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}},
  name: 'CalendarDateTime'
};

export let ZonedDateTimeType: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), formatOptions: {dateStyle: 'long', timeStyle: 'long'}},
  name: 'ZonedDateTime'
};

export let DateType: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: new Date(2000, 5, 5), formatOptions: {dateStyle: 'long'}},
  name: 'Date'
};

export let TimeType: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: new Time(9, 45), formatOptions: {timeStyle: 'short'}},
  name: 'Time'
};

export let CalendarDateRange: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}, formatOptions: {dateStyle: 'medium'}},
  name: 'RangeValue<CalendarDate>'
};

export let CalendarDateTimeRange: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: {start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120)}, formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}},
  name: 'RangeValue<CalendarDateTime>'
};

export let ZonedDateTimeRange: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: {start: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), end: new ZonedDateTime(2020, 3, 3, 'America/Los_Angeles', -28800000)}, formatOptions: {dateStyle: 'medium', timeStyle: 'medium'}},
  name: 'RangeValue<ZonedDateTime>'
};

export let DateRange: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: {start: new Date(2019, 6, 5), end: new Date(2019, 6, 10)}, formatOptions: {dateStyle: 'medium'}},
  name: 'RangeValue<Date>'
};

export let TimeRange: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: {start: new Time(9, 45), end: new Time(10, 50)}, formatOptions: {timeStyle: 'short'}},
  name: 'RangeValue<Time>'
};

export let Number: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: 10},
  name: 'Number'
};

export let NumberRange: StaticFieldStory = {
  ...Default,
  args: {...Default.args, value: {start: 10, end: 20}},
  name: 'RangeValue<Number>'
};
