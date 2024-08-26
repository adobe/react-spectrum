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
import {ControlItem, SegmentedControl} from '../src';
import ListBulleted from '../s2wf-icons/S2_Icon_ListBulleted_20_N.svg';
import ListMultiSelect from '../s2wf-icons/S2_Icon_ListMultiSelect_20_N.svg';
import ListNumbered from '../s2wf-icons/S2_Icon_ListNumbered_20_N.svg';
import type {Meta} from '@storybook/react';
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
    <ControlItem value="day">Day</ControlItem>
    <ControlItem value="week">Week</ControlItem>
    <ControlItem value="month">Month</ControlItem>
    <ControlItem value="year">Year</ControlItem>
  </SegmentedControl>
);


export const WithIcons = (args: any) => (
  <SegmentedControl {...args}>
    <ControlItem value="unordered"><ListBulleted />Unordered</ControlItem>
    <ControlItem value="ordered"><ListNumbered />Ordered</ControlItem>
    <ControlItem value="task list"><ListMultiSelect />Task List</ControlItem>
  </SegmentedControl>
);

export const OnlyIcons = (args: any) => (
  <SegmentedControl {...args}>
    <ControlItem value="align bottom"><AlignBottom /></ControlItem>
    <ControlItem value="align center"><AlignCenter /></ControlItem>
    <ControlItem value="align left"><AlignLeft /></ControlItem>
  </SegmentedControl>
);

export const CustomWidth = (args: any) => (
  <SegmentedControl {...args} styles={style({width: '[400px]'})}>
    <ControlItem value="overview">Overview</ControlItem>
    <ControlItem value="specs">Specs</ControlItem>
    <ControlItem value="guidelines">Guidelines</ControlItem>
    <ControlItem value="accessibility">Accessibility</ControlItem>
  </SegmentedControl>
);
