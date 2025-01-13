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

export const Example = {
  render: (args: any) => (
    <SegmentedControl {...args}>
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

export const WithIcons = {
  render: (args: any) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem id="unordered"><ListBulleted /><Text>Unordered</Text></SegmentedControlItem>
      <SegmentedControlItem id="ordered"><ListNumbered /><Text>Ordered</Text></SegmentedControlItem>
      <SegmentedControlItem id="task list"><ListMultiSelect /><Text>Task List</Text></SegmentedControlItem>
    </SegmentedControl>
  ),
  args: {
    'aria-label': 'List organization'
  }
};

export const OnlyIcons = {
  render: (args: any) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem id="align bottom"><AlignBottom /></SegmentedControlItem>
      <SegmentedControlItem id="align center"><AlignCenter /></SegmentedControlItem>
      <SegmentedControlItem id="align left"><AlignLeft /></SegmentedControlItem>
    </SegmentedControl>
  ),
  args: {
    'aria-label': 'Text alignment'
  }
};

export const CustomWidthJustified = {
  render: (args: any) => (
    <SegmentedControl {...args} styles={style({width: 400})}>
      <SegmentedControlItem id="overview">Overview</SegmentedControlItem>
      <SegmentedControlItem id="specs">Specs</SegmentedControlItem>
      <SegmentedControlItem id="guidelines">Guidelines</SegmentedControlItem>
      <SegmentedControlItem id="accessibility">Accessibility</SegmentedControlItem>
    </SegmentedControl>
  ),
  args: {
    'aria-label': 'Getting started',
    isJustified: true
  }
};
