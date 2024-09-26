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
import ListBulleted from '../s2wf-icons/S2_Icon_ListBulleted_20_N.svg';
import ListMultiSelect from '../s2wf-icons/S2_Icon_ListMultiSelect_20_N.svg';
import ListNumbered from '../s2wf-icons/S2_Icon_ListNumbered_20_N.svg';
import type {Meta} from '@storybook/react';
import {SegmentedControl, SegmentedControlItem, Text} from '../src';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof SegmentedControl> = {
  component: SegmentedControl,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/SegmentedControl'
};

export default meta;

export const Example = (args: any) => (
  <SegmentedControl {...args} styles={style({width: '[250px]'})}>
    <SegmentedControlItem value="day">Day</SegmentedControlItem>
    <SegmentedControlItem value="week">Week</SegmentedControlItem>
    <SegmentedControlItem value="month">Month</SegmentedControlItem>
    <SegmentedControlItem value="year">Year</SegmentedControlItem>
  </SegmentedControl>
);

Example.args = {
  'aria-label': 'Time granularity'
};

export const WithIcons = (args: any) => (
  <SegmentedControl {...args} styles={style({width: '[400px]'})}>
    <SegmentedControlItem value="unordered"><ListBulleted /><Text>Unordered</Text></SegmentedControlItem>
    <SegmentedControlItem value="ordered"><ListNumbered /><Text>Ordered</Text></SegmentedControlItem>
    <SegmentedControlItem value="task list"><ListMultiSelect /><Text>Task List</Text></SegmentedControlItem>
  </SegmentedControl>
);

WithIcons.args = {
  'aria-label': 'List organization'
};

export const OnlyIcons = (args: any) => (
  <SegmentedControl styles={style({maxWidth: 'fit'})} {...args}>
    <SegmentedControlItem value="align bottom"><AlignBottom /></SegmentedControlItem>
    <SegmentedControlItem value="align center"><AlignCenter /></SegmentedControlItem>
    <SegmentedControlItem value="align left"><AlignLeft /></SegmentedControlItem>
  </SegmentedControl>
);

OnlyIcons.args = {
  'aria-label': 'Text alignment'
};

export const CustomWidth = (args: any) => (
  <SegmentedControl {...args} styles={style({width: '[400px]'})}>
    <SegmentedControlItem value="overview">Overview</SegmentedControlItem>
    <SegmentedControlItem value="specs">Specs</SegmentedControlItem>
    <SegmentedControlItem value="guidelines">Guidelines</SegmentedControlItem>
    <SegmentedControlItem value="accessibility">Accessibility</SegmentedControlItem>
  </SegmentedControl>
);

CustomWidth.args = {
  'aria-label': 'Getting started'
};
