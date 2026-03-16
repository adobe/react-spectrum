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
import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Heading} from '@react-spectrum/text';
import {LabeledValue} from '..';
import {Link} from '@react-spectrum/link';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';

const meta: Meta<typeof LabeledValue> = {
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
};

export default meta;

export type LabeledValueStory = StoryObj<typeof LabeledValue>;

export const Default: LabeledValueStory = {
  args: {label: 'Test', value: 'foo '.repeat(20)},
  name: 'String'
};

export const StringArray: LabeledValueStory = {
  args: {label: 'Test', value: ['wow', 'cool', 'awesome']},
  name: 'String array'
};

export const CalendarDateType: LabeledValueStory = {
  args: {label: 'Test', value: new CalendarDate(2019, 6, 5)},
  name: 'CalendarDate'
};

export const CalendarDateTimeType: LabeledValueStory = {
  args: {label: 'Test', value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120)},
  name: 'CalendarDateTime'
};

export const CalendarDateTimeTypeFormatOptions: LabeledValueStory = {
  args: {label: 'Test', value: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), formatOptions: {dateStyle: 'short', timeStyle: 'short'}},
  name: 'CalendarDateTime with formatOptions'
};

export const ZonedDateTimeType: LabeledValueStory = {
  args: {label: 'Test', value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000)},
  name: 'ZonedDateTime'
};

export const DateType: LabeledValueStory = {
  args: {label: 'Test', value: new Date(2000, 5, 5)},
  name: 'Date'
};

export const TimeType: LabeledValueStory = {
  args: {label: 'Test', value: new Time(9, 45)},
  name: 'Time'
};

export const CalendarDateRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}},
  name: 'RangeValue<CalendarDate>'
};

export const CalendarDateTimeRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new CalendarDateTime(2020, 2, 3, 12, 23, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 23, 24, 120)}},
  name: 'RangeValue<CalendarDateTime>'
};

export const ZonedDateTimeRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), end: new ZonedDateTime(2020, 3, 3, 'America/Los_Angeles', -28800000)}},
  name: 'RangeValue<ZonedDateTime>'
};

export const DateRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new Date(2019, 6, 5), end: new Date(2019, 6, 10)}},
  name: 'RangeValue<Date>'
};

export const TimeRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: new Time(9, 45), end: new Time(10, 50)}},
  name: 'RangeValue<Time>'
};

export const Number: LabeledValueStory = {
  args: {label: 'Test', value: 10},
  name: 'Number'
};

export const NumberRange: LabeledValueStory = {
  args: {label: 'Test', value: {start: 10, end: 20}},
  name: 'RangeValue<Number>'
};


export const CustomComponent: LabeledValueStory = {
  args: {
    label: 'Test',
    value: <Link href="https://www.adobe.com">Adobe</Link>
  },
  name: 'Custom component'
};

export const WithContextualHelp: LabeledValueStory = {
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
