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

import {Button, Content, ContextualHelp, DateRangePicker, Footer, Form, Heading, Link, Text} from '../src';
import {CalendarSwitcher, categorizeArgTypes} from './utils';
import {fn} from '@storybook/test';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', ['onChange', 'onOpenChange']),
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}},
    visibleMonths: {
      control: {
        type: 'select'
      },
      options: [1, 2, 3]
    }
  },
  args: {
    onOpenChange: fn(),
    onChange: fn()
  },
  title: 'DateRangePicker',
  decorators: [
    (Story) => (
      <CalendarSwitcher>
        <Story />
      </CalendarSwitcher>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof DateRangePicker>;

export const Example: Story = {
  args: {
    label: 'Reservation dates'
  }
};

export const AriaLabel: Story = {
  args: {
    'aria-label': 'Reservation dates'
  }
};

export const Validation: Story = {
  render: (args) => (
    <Form>
      <DateRangePicker {...args} />
      <Button type="submit" variant="primary">Submit</Button>
    </Form>
  ),
  args: {
    label: 'Reservation dates',
    isRequired: true
  }
};

export const CustomWidth: Story = {
  render: (args) => (
    <DateRangePicker {...args} styles={style({width: 384})} />
  ),
  args: {
    label: 'Reservation dates'
  }
};

export const ContextualHelpExample: Story = {
  render: (args) => (
    <DateRangePicker
      {...args}
      contextualHelp={
        <ContextualHelp>
          <Heading>Quantity</Heading>
          <Content>
            <Text>
              Enter a date, any date. May I recommend today?
            </Text>
          </Content>
          <Footer>
            <Link
              isStandalone
              href="https://en.wikipedia.org/wiki/Wikipedia:On_this_day/Today"
              target="_blank">Learn more about what happened on this date.</Link>
          </Footer>
        </ContextualHelp>
      } />
  ),
  args: {
    label: 'On this day'
  }
};
