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

import {Meta, Story} from '@storybook/react';
import {RangeSlider} from '../';
import React from 'react';
import {SpectrumRangeSliderProps} from '@react-types/slider';

const meta: Meta<SpectrumRangeSliderProps> = {
  title: 'RangeSlider',
  component: RangeSlider
};

export default meta;


const Template = (): Story<SpectrumRangeSliderProps> => (args) => (
  <RangeSlider {...args} />
);


export const Default = Template().bind({});
Default.args = {label: 'RangeSlider label'};

export const Disabled = Template().bind({});
Disabled.args = {...Default.args, isDisabled: true};
/*
Doesn't exist yet
export const Vertical = Template().bind({});
Vertical.args = {...Default.args, orientation: 'vertical'};
*/

export const SmallerRange = Template().bind({});
SmallerRange.args = {...Default.args, defaultValue: {start: 30, end: 70}};

/*
Not supported but prop exists
export const LabelAlignEnd = Template().bind({});
LabelAlignEnd.args = {...Default.args, labelAlign: 'end', showValueLabel: false};
*/

export const LabelAlignEnd = Template().bind({});
LabelAlignEnd.args = {...Default.args, labelAlign: 'end'};
