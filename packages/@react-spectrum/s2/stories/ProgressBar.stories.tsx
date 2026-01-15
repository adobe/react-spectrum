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

import type {Meta, StoryObj} from '@storybook/react';
import {ProgressBar} from '../src';
import {StaticColorDecorator} from './utils';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {control: {type: 'text'}}
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  title: 'ProgressBar'
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Example: Story = {
  args: {
    label: 'Loading…',
    value: 80
  }
};

export const CustomWidth: Story = {
  args: {
    label: 'Loading…',
    value: 80,
    styles: style({width: 384})
  }
};
