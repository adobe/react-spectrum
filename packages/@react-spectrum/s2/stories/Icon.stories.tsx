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

import AlertIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {FunctionComponent} from 'react';
import {IconProps} from '../src';
import {iconStyle} from '../style' with {type: 'macro'};
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';

const Alert = AlertIcon as FunctionComponent<IconProps>;

const meta: Meta<FunctionComponent<IconProps>> = {
  component: NewIcon as FunctionComponent<IconProps>,
  parameters: {
    layout: 'centered'
  },
  title: 'Icon'
};

export default meta;

type Story = StoryObj<typeof NewIcon>;
export const Example: Story = {};

export const ColorAndSize: Story = {
  render: (args) => {
    return (
      <Alert {...args} styles={iconStyle({color: 'negative', size: 'XL'})} />
    );
  }
};
