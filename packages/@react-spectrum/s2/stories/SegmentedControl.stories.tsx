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

import AlignBottom from '../s2wf-icons/S2_Icon_AlignBottom_20_N.svg';
import AlignCenter from '../s2wf-icons/S2_Icon_AlignCenter_20_N.svg';
import AlignLeft from '../s2wf-icons/S2_Icon_AlignLeft_20_N.svg';
import {fn} from '@storybook/test';
import ListBulleted from '../s2wf-icons/S2_Icon_ListBulleted_20_N.svg';
import ListMultiSelect from '../s2wf-icons/S2_Icon_ListMultiSelect_20_N.svg';
import ListNumbered from '../s2wf-icons/S2_Icon_ListNumbered_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import {SegmentedControl, SegmentedControlItem, Text} from '../src';
import {style} from '../style' with {type: 'macro'};


const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    children: {table: {disable: true}}
  },
  tags: ['autodocs'],
  title: 'SegmentedControl',
  args: {
    onSelectionChange: fn()
  }
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const justifiedStyle = style({
  width: 400
});

export const Example: Story = {
  render: (args) => (
    <SegmentedControl {...args} styles={args.isJustified ? justifiedStyle : undefined}>
      <SegmentedControlItem id="day">Day</SegmentedControlItem>
      <SegmentedControlItem id="week">Week</SegmentedControlItem>
      <SegmentedControlItem id="month">Month</SegmentedControlItem>
      <SegmentedControlItem id="year">Year</SegmentedControlItem>
    </SegmentedControl>
  ),
  args: {
    'aria-label': 'Time granularity'
  }
};

export const WithIcons: Story = {
  render: (args) => (
    <SegmentedControl {...args} styles={args.isJustified ? justifiedStyle : undefined}>
      <SegmentedControlItem id="unordered"><ListBulleted /><Text>Unordered</Text></SegmentedControlItem>
      <SegmentedControlItem id="ordered"><ListNumbered /><Text>Ordered</Text></SegmentedControlItem>
      <SegmentedControlItem id="task list"><ListMultiSelect /><Text>Task List</Text></SegmentedControlItem>
    </SegmentedControl>
  ),
  args: {
    'aria-label': 'List organization'
  }
};

export const OnlyIcons: Story = {
  render: (args) => (
    <SegmentedControl {...args} styles={args.isJustified ? justifiedStyle : undefined}>
      <SegmentedControlItem aria-label="Align bottom" id="align bottom"><AlignBottom /></SegmentedControlItem>
      <SegmentedControlItem aria-label="Align center" id="align center"><AlignCenter /></SegmentedControlItem>
      <SegmentedControlItem aria-label="Align left" id="align left"><AlignLeft /></SegmentedControlItem>
    </SegmentedControl>
  ),
  args: {
    'aria-label': 'Text alignment'
  }
};
