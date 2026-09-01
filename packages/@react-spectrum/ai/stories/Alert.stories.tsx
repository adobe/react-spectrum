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

import {Alert} from '../src/Alert';
import {categorizeArgTypes, getActionArgs} from '../../s2/stories/utils';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const events = ['onDismiss'];

const meta: Meta<typeof Alert> = {
  component: Alert,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    variant: {
      control: 'radio',
      options: ['informative', 'positive', 'notice', 'negative', 'neutral']
    }
  },
  args: {
    children: 'In-line alert description.',
    variant: 'neutral',
    ...getActionArgs(events)
  },
  title: 'AI/Alert'
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Example: Story = {
  render: args => <Alert {...args} styles={style({width: 336})} />
};

const VARIANTS = ['informative', 'positive', 'notice', 'negative', 'neutral'] as const;

export const AllVariants: Story = {
  name: 'All variants',
  render: args => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 12})}>
      {VARIANTS.map(variant => (
        <Alert {...args} key={variant} variant={variant} styles={style({width: 336})} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};
