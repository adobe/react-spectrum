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
import {ProgressCircle} from '../src';
import {StaticColorDecorator} from './utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof ProgressCircle> = {
  component: ProgressCircle,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  title: 'ProgressCircle'
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const Example: Story = {
  render: (args) => <ProgressCircle aria-label="Test Progress Circle" {...args} />,
  args: {
    staticColor: undefined,
    value: 80
  },
  argTypes: {
    staticColor: {
      control: 'select',
      options: [undefined, 'white', 'black', 'auto']
    },
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100
      }
    }
  }
};

export const CustomSize = (args) => <ProgressCircle aria-label="Test Progress Circle" value="40" size="S" {...args} styles={style({size: 20})} />;
CustomSize.parameters = {
  docs: {
    disable: true
  }
};
