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

import {ColorSwatch} from '../src/ColorSwatch';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};

const meta: Meta<typeof ColorSwatch> = {
  component: ColorSwatch,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'ColorSwatch'
};

export default meta;
type Story = StoryObj<typeof ColorSwatch>;

export const Example: Story = {
  render: (args) => <ColorSwatch {...args} />,
  args: {
    color: 'rgb(255, 0, 0)'
  }
};

export const NoValue: Story = {
  render: (args) => <ColorSwatch {...args} />
};

export const CustomWidth: Story = {
  render: (args) => <ColorSwatch {...args} styles={style({width: 96})} />,
  args: Example.args
};
