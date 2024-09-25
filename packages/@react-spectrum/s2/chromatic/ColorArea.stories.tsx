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

import {ColorArea} from '../src';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof ColorArea> = {
  component: ColorArea,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/ColorArea'
};

export default meta;

export const Default = {
  render: (args) => <ColorArea {...args} />,
  args: {
    defaultValue: 'hsl(30, 100%, 50%)'
  }
};

export const Disabled = {
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true
  }
};
