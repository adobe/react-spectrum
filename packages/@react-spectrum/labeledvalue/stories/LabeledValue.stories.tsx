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
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Heading} from '@react-spectrum/text';
import {LabeledValue} from '..';
import React from 'react';

type LabeledValueStory = ComponentStoryObj<typeof LabeledValue>;

export default {
  title: 'LabeledValue',
  component: LabeledValue,
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
} as ComponentMeta<typeof LabeledValue>;

export let Default: LabeledValueStory = {
  args: {label: 'Test', value: 'foo '.repeat(20)},
  name: 'String'
};

export let StringArray: LabeledValueStory = {
  args: {label: 'Test', value: ['wow', 'cool', 'awesome']},
  name: 'String array'
};

export let CalendarDateType: LabeledValueStory = {
  args: {label: 'Test', value: new CalendarDate(2019, 6, 5)},
  name: 'CalendarDate'
};

export let CalendarDateTimeType: LabeledValueStory = {
  args: {label: 'Test', value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120)},
  name: 'CalendarDateTime'
};

export let CalendarDateTimeTypeFormatOptions: LabeledValueStory = {
  args: {label: 'Test', value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), formatOptions: {dateStyle: 'short', timeStyle: 'short'}},
  name: 'CalendarDateTime with formatOptions'
};

export let ZonedDateTimeType: LabeledValueStory = {
  args: {label: 'Test', value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000)},
  name: 'ZonedDateTime'
};

export let DateType: LabeledValueStory = {
  args: {label: 'Test', value: new Date(2000, 5, 5)},
  name: 'Date'
};

export let TimeType: LabeledValueStory = {
  args: {label: 'Test', value: new Time(9, 45)},
  name: 'Time'
};

export let CalendarDateRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}},
  name: 'RangeValue<CalendarDate>'
};

export let CalendarDateTimeRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120)}},
  name: 'RangeValue<CalendarDateTime>'
};

export let ZonedDateTimeRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), end: new ZonedDateTime(2020, 3, 3, 'America/Los_Angeles', -28800000)}},
  name: 'RangeValue<ZonedDateTime>'
};

export let DateRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new Date(2019, 6, 5), end: new Date(2019, 6, 10)}},
  name: 'RangeValue<Date>'
};

export let TimeRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new Time(9, 45), end: new Time(10, 50)}},
  name: 'RangeValue<Time>'
};

export let Number: LabeledValueStory = {
  args: {label: 'Test', value: 10},
  name: 'Number'
};

export let NumberRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: 10, end: 20}},
  name: 'RangeValue<Number>'
};

export let WithContextualHelp: LabeledValueStory = {
  args: {
    label: 'Test',
    value: 25,
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )
  },
  name: 'contextual help'
};
