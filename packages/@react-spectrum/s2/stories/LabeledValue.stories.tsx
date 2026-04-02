/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {Content, Heading, Text} from '../src/Content';
import {ContextualHelp} from '../src/ContextualHelp';
import {Form} from '../src/Form';
import {LabeledValue} from '../src/LabeledValue';
import {Link} from '../src/Link';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof LabeledValue> = {
  component: LabeledValue,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    label: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}},
    value: {table: {disable: true}},
    labelPosition: {
      control: {type: 'radio'},
      options: ['top', 'side']
    },
    labelAlign: {
      control: {type: 'radio'},
      options: ['start', 'end']
    },
    size: {
      control: {type: 'radio'},
      options: ['S', 'M', 'L', 'XL']
    }
  },
  args: {
    label: 'Name'
  },
  title: 'LabeledValue'
};

export default meta;
type Story = StoryObj<typeof LabeledValue>;

export const StringValue: Story = {
  args: {
    label: 'Name',
    value: 'Jane Smith'
  },
  name: 'String'
};

export const StringListValue: Story = {
  render: (args) => <LabeledValue {...args} label="Pets" value={['Dogs', 'Cats', 'Fish']} />,
  name: 'String array'
};

export const NumberValue: Story = {
  render: (args) => <LabeledValue {...args} label="Price" value={1234.56} formatOptions={{style: 'currency', currency: 'USD'}} />,
  name: 'Number'
};

export const NumberRangeValue: Story = {
  render: (args) => <LabeledValue {...args} label="Quantity Range" value={{start: 10, end: 50}} />,
  name: 'RangeValue<Number>'
};

export const DateValue: Story = {
  render: (args) => <LabeledValue {...args} label="Birthday" value={new CalendarDate(2024, 3, 15)} />,
  name: 'CalendarDate'
};

export const DateRangeValue: Story = {
  render: (args) => (
    <LabeledValue
      {...args}
      label="Vacation"
      value={{start: new CalendarDate(2024, 3, 15), end: new CalendarDate(2024, 3, 22)}} />
  ),
  name: 'RangeValue<CalendarDate>'
};

export const CalendarDateTimeValue: Story = {
  render: (args) => (
    <LabeledValue
      {...args}
      label="Meeting"
      value={new CalendarDateTime(2024, 3, 15, 10, 30, 0)} />
  ),
  name: 'CalendarDateTime'
};

export const CalendarDateTimeRangeValue: Story = {
  render: (args) => (
    <LabeledValue
      {...args}
      label="Event"
      value={{start: new CalendarDateTime(2024, 3, 15, 10, 30, 0), end: new CalendarDateTime(2024, 3, 15, 12, 0, 0)}} />
  ),
  name: 'RangeValue<CalendarDateTime>'
};

export const ZonedDateTimeValue: Story = {
  render: (args) => (
    <LabeledValue
      {...args}
      label="Meeting Time"
      value={new ZonedDateTime(2024, 3, 15, 'America/Los_Angeles', -28800000, 10, 30)} />
  ),
  name: 'ZonedDateTime'
};

export const TimeValue: Story = {
  render: (args) => <LabeledValue {...args} label="Start Time" value={new Time(14, 30)} />,
  name: 'Time'
};

export const TimeRangeValue: Story = {
  render: (args) => <LabeledValue {...args} label="Office Hours" value={{start: new Time(9, 0), end: new Time(17, 0)}} />,
  name: 'RangeValue<Time>'
};

export const SideLabelPosition: Story = {
  args: {
    label: 'Name',
    value: 'Jane Smith',
    labelPosition: 'side'
  },
  name: 'Label position side'
};

export const WithContextualHelp: Story = {
  render: (args) => (
    <LabeledValue
      {...args}
      label="Account Owner"
      value="Jane Smith"
      contextualHelp={
        <ContextualHelp>
          <Heading>About this field</Heading>
          <Content>
            <Text>This field displays the account owner's full legal name.</Text>
          </Content>
        </ContextualHelp>
      } />
  ),
  name: 'Contextual help'
};

export const CustomComponent: Story = {
  render: (args) => (
    <LabeledValue
      {...args}
      label="Website"
      value={<Link href="https://www.adobe.com">Adobe</Link>} />
  ),
  name: 'Custom component'
};

export const CustomWidth: Story = {
  render: (args) => (
    <LabeledValue {...args} label="Name" value="Jane Smith" styles={style({width: 384})} />
  ),
  name: 'Custom width',
  parameters: {docs: {disable: true}}
};

export const InForm: Story = {
  render: (args) => (
    <Form>
      <LabeledValue {...args} label="Name" value="Jane Smith" />
    </Form>
  ),
  name: 'In form',
  parameters: {docs: {disable: true}}
};
