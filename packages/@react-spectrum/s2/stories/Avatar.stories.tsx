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

import {Avatar} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style' with { type: 'macro' };

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  argTypes: {
    size: {
      control: 'number'
    }
  },
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  decorators: (children, {args}) => (
    args.isOverBackground ? (
      <div className={style({backgroundColor: 'indigo-800', padding: 40})}>
        {children(args)}
      </div>
    ) : children(args)
  ),
  title: 'Avatar'
};

export default meta;

type Story = StoryObj<typeof Avatar>;
export const Example: Story = {
  render: (args) => (
    <Avatar alt="design provided" src="https://i.imgur.com/xIe7Wlb.png" {...args} />
  )
};
