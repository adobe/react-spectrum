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

import {Badge} from '../src/Badge';
import {Button} from '../src/Button';
import {CalendarDate, CalendarDateTime, Time, ZonedDateTime} from '@internationalized/date';
import {ComboBox, ComboBoxItem} from '../src/ComboBox';
import {Content, Heading} from '../src/Content';
import {ContextualHelp} from '../src/ContextualHelp';
import {Form} from '../src/Form';
import {LabeledValue} from '../src/LabeledValue';
import {Link} from '../src/Link';
import type {Meta, StoryObj} from '@storybook/react';
import {NumberField} from '../src/NumberField';
import {ReactElement} from 'react';
import {StatusLight} from '../src/StatusLight';
import {style} from '../style' with {type: 'macro'};
import {TextField} from '../src/TextField';

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


export const Default: Story = {
  args: {label: 'Name', value: 'Jane Smith'},
  name: 'String'
};

export const LongText: Story = {
  args: {label: 'Test', value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'},
  name: 'Long text'
};

export const StringArray: Story = {
  args: {label: 'Pets', value: ['Dogs', 'Cats', 'Fish']},
  name: 'String array'
};

export const CalendarDateType: Story = {
  args: {label: 'Birthday', value: new CalendarDate(2019, 6, 5)},
  name: 'CalendarDate'
};

export const CalendarDateTimeType: Story = {
  args: {label: 'Meeting Time', value: new CalendarDateTime(2020, 2, 3, 12, 30, 24, 120)},
  name: 'CalendarDateTime'
};

export const CalendarDateTimeTypeFormatOptions: Story = {
  args: {label: 'Meeting Time', value: new CalendarDateTime(2020, 2, 3, 12, 30, 24, 120), formatOptions: {dateStyle: 'short', timeStyle: 'short'}},
  name: 'CalendarDateTime with formatOptions'
};

export const ZonedDateTimeType: Story = {
  args: {label: 'Meeting Time', value: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000)},
  name: 'ZonedDateTime'
};

export const DateType: Story = {
  args: {label: 'Birthday', value: new Date(2000, 5, 5)},
  name: 'Date'
};

export const TimeType: Story = {
  args: {label: 'Start time', value: new Time(9, 45)},
  name: 'Time'
};

export const CalendarDateRange: Story = {
  args: {label: 'Vacation', value: {start: new CalendarDate(2019, 6, 5), end: new CalendarDate(2019, 7, 5)}},
  name: 'RangeValue<CalendarDate>'
};

export const CalendarDateTimeRange: Story = {
  args: {label: 'Sabbatical', value: {start: new CalendarDateTime(2020, 2, 3, 12, 30, 24, 120), end: new CalendarDateTime(2020, 3, 3, 12, 30, 24, 120)}},
  name: 'RangeValue<CalendarDateTime>'
};

export const ZonedDateTimeRange: Story = {
  args: {label: 'Event Time', value: {start: new ZonedDateTime(2020, 2, 3, 'America/Los_Angeles', -28800000), end: new ZonedDateTime(2020, 3, 3, 'America/Los_Angeles', -28800000)}},
  name: 'RangeValue<ZonedDateTime>'
};

export const DateRange: Story = {
  args: {label: 'Test', value: {start: new Date(2019, 6, 5), end: new Date(2019, 6, 10)}},
  name: 'RangeValue<Date>'
};

export const TimeRange: Story = {
  args: {label: 'Office Hours', value: {start: new Time(9, 45), end: new Time(10, 50)}},
  name: 'RangeValue<Time>'
};

export const Number: Story = {
  args: {label: 'Quantity', value: 10},
  name: 'Number'
};

export const NumberRange: Story = {
  args: {label: 'Normal Range', value: {start: 10, end: 20}},
  name: 'RangeValue<Number>'
};

export const CustomComponents: Story = {
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 36, padding: 8, justifyContent: 'center', flexDirection: 'column'}}>
        <LabeledValue {...args as any} value={<Badge variant="positive">Licensed</Badge>} />
        <LabeledValue {...args as any} value={<Link href="https://www.adobe.com">Adobe</Link>} />
        <LabeledValue {...args as any} value={<StatusLight variant="positive">Ready</StatusLight>} />
      </div>
    );
  },
  args: {
    label: 'Test'
  },
  name: 'Custom components'
};

export const WithContextualHelp: Story = {
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
  name: 'Contextual help'
};

const FormCustomLayout = (args): ReactElement => {
  return (
    <Form {...args}>
      <div role="group" aria-labelledby="searchLabel" className={style({display: 'flex', alignItems: 'center', gap: 8, font: 'ui'})}>
        <TextField label="Query" styles={style({width: 144})} placeholder="Enter your name" />
        <ComboBox label="Search terms" styles={style({width: 144})}>
          <ComboBoxItem>search term 1</ComboBoxItem>
          <ComboBoxItem>search term 2</ComboBoxItem>
        </ComboBox>
        <NumberField label="Number of results" placeholder="–" defaultValue={50} styles={style({width: 120})} />
        <LabeledValue label="Name" value="Jane Smith" styles={style({width: 96})} />
      </div>
      <Button type="submit" variant="primary" styles={style({gridColumnStart: 'field', width: 'fit'})}>Submit</Button>
    </Form>
  );
};

export const FormCustomLayoutExample: StoryObj<typeof FormCustomLayout> = {
  render: (args) => <FormCustomLayout {...args} />,
  parameters: {
    docs: {
      disable: true
    }
  }
};

const FormLayoutExample = (args): ReactElement => {
  return (
    <Form {...args}>
      <TextField label="Query" styles={style({width: 144})} placeholder="Enter your name" />
      <ComboBox label="Search terms" styles={style({width: 144})}>
        <ComboBoxItem>search term 1</ComboBoxItem>
        <ComboBoxItem>search term 2</ComboBoxItem>
      </ComboBox>
      <NumberField label="Number of results" placeholder="–" defaultValue={50} styles={style({width: 120})} />
      <LabeledValue label="Name" value="Jane Smith" styles={style({width: 96})} />
      <Button type="submit" variant="primary" styles={style({gridColumnStart: 'field', width: 'fit'})}>Submit</Button>
    </Form>
  );
};

export const FormLayout: StoryObj<typeof FormLayoutExample> = {
  render: (args) => <FormLayoutExample {...args} />,
  parameters: {
    docs: {
      disable: true
    }
  }
};

