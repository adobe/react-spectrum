/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import {ComponentProps, ReactElement, useState} from 'react';
import {MessageFeedback} from '@react-spectrum/ai';
import type {Meta, StoryObj} from '@storybook/react';

const events = ['onChange'];

const meta: Meta<typeof MessageFeedback> = {
  component: MessageFeedback,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    value: {table: {disable: true}},
    defaultValue: {table: {disable: true}}
  },
  args: {
    'aria-label': 'Rate this response',
    ...getActionArgs(events)
  },
  title: 'AI/MessageFeedback'
};

export default meta;
type Story = StoryObj<typeof MessageFeedback>;

export const Example: Story = {};

export const InitiallyUp: Story = {
  args: {defaultValue: 'up'}
};

export const InitiallyDown: Story = {
  args: {defaultValue: 'down'}
};

export const Disabled: Story = {
  args: {isDisabled: true}
};

function ControlledExample(args: ComponentProps<typeof MessageFeedback>): ReactElement {
  let [value, setValue] = useState<'up' | 'down' | null>(null);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
      <MessageFeedback {...args} value={value} onChange={setValue} />
      <span>Current value: {String(value)}</span>
    </div>
  );
}

export const Controlled: Story = {
  render: args => <ControlledExample {...args} />
};
