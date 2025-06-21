/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Content} from '@react-spectrum/view';
import {ContextualHelp} from '@react-spectrum/contextualhelp';
import {Heading} from '@react-spectrum/text';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {Slider} from '../';
import {SpectrumSliderProps} from '@react-types/slider';

const meta: Meta<SpectrumSliderProps> = {
  title: 'Slider',
  component: Slider
} as Meta<SpectrumSliderProps>;

export default meta;

export type SliderStory = StoryObj<typeof Slider>;

export const Default: SliderStory = {
  args: {label: 'Slider label'}
};

export const Disabled: SliderStory = {
  args: {...Default.args, isDisabled: true}
};

export const LabelPositionSide: SliderStory = {
  args: {...Default.args, labelPosition: 'side'}
};

export const Value50: SliderStory = {
  args: {...Default.args, defaultValue: 50}
};

export const Filled: SliderStory = {
  args: {...Value50.args, isFilled: true}
};

export const FillOffset: SliderStory = {
  args: {...Filled.args, defaultValue: 80, fillOffset: 50}
};

export const TrackGradient: SliderStory = {
  args: {
    ...Default.args,
    isFilled: true,
    defaultValue: 30,
    trackGradient: ['white', 'rgba(177,141,32,1)']
  }
};

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp: SliderStory = {
  args: {label: 'Slider label', contextualHelp}
};

export const ContextualHelpSideLabel: SliderStory = {
  args: {label: 'Slider label', contextualHelp, labelPosition: 'side'}
};
