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

import type {Meta} from '@storybook/react';
import {SegmentedControl, ControlItem} from '../src';
import EditIcon from '../s2wf-icons/S2_Icon_Edit_20_N.svg';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <SegmentedControl {...args}>
    <ControlItem value="control 1">Control 1</ControlItem>
    <ControlItem value="control 2">Control 2</ControlItem>
    <ControlItem value="control 3">Control 3</ControlItem>
  </SegmentedControl>
)


export const WithIcons = (args: any) => (
  <SegmentedControl {...args}>
    <ControlItem value="control 1"><EditIcon />Control 1</ControlItem>
    <ControlItem value="control 2"><EditIcon />Control 2</ControlItem>
    <ControlItem value="control 3"><EditIcon />Control 3</ControlItem>
  </SegmentedControl>
)

export const OnlyIcons = (args: any) => (
  <SegmentedControl {...args}>
    <ControlItem value="control 1"><EditIcon /></ControlItem>
    <ControlItem value="control 2"><EditIcon /></ControlItem>
    <ControlItem value="control 3"><EditIcon /></ControlItem>
  </SegmentedControl>
)