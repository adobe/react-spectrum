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
import {Meta} from '@storybook/react';
import {RangeSlider} from '../';
import React from 'react';
import {SpectrumRangeSliderProps} from '@react-types/slider';

const meta: Meta<SpectrumRangeSliderProps> = {
  title: 'RangeSlider',
  component: RangeSlider
};

export default meta;

export const Default = {
  args: {label: 'RangeSlider label'}
};

export const Disabled = {
  args: {...Default.args, isDisabled: true}
};

export const SmallerRange = {
  args: {...Default.args, defaultValue: {start: 30, end: 70}}
};

export const LabelAlignEnd = {
  args: {...Default.args, labelAlign: 'end'}
};

let contextualHelp = (
  <ContextualHelp>
    <Heading>What is a segment?</Heading>
    <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
  </ContextualHelp>
);

export const _ContextualHelp = {
  args: {label: 'Slider label', contextualHelp}
};

export const ContextualHelpSideLabel = {
  args: {label: 'Slider label', contextualHelp, labelPosition: 'side'}
};
