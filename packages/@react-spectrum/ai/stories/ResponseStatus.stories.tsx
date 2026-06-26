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
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {ResponseStatus, ResponseStatusPanel, ResponseStatusTitle} from '@react-spectrum/ai';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const events = ['onExpandedChange'];

const meta: Meta<typeof ResponseStatus> = {
  component: ResponseStatus,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    size: {
      control: 'radio',
      options: ['S', 'M', 'L', 'XL']
    },
    density: {
      control: 'radio',
      options: ['compact', 'regular', 'spacious']
    },
    isLoading: {
      control: {type: 'boolean'}
    },
    children: {table: {disable: true}}
  },
  args: {
    isLoading: true,
    ...getActionArgs(events)
  },
  title: 'AI/ResponseStatus'
};

export default meta;
type Story = StoryObj<typeof ResponseStatus>;

export const Example: Story = {
  render: args => (
    <div className={style({width: 320, minHeight: 240})}>
      <ResponseStatus {...args}>
        <ResponseStatusTitle>
          {args.isLoading ? 'Generating response' : 'Response generated'}
        </ResponseStatusTitle>
        <ResponseStatusPanel>
          Here is the generated response content. This area is hidden until the disclosure is
          expanded, and cannot be expanded while loading.
        </ResponseStatusPanel>
      </ResponseStatus>
    </div>
  )
};
