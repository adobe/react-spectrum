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
import {ProgressBar} from '../';
import React, {CSSProperties} from 'react';
import {SpectrumProgressBarProps} from '@react-types/progress';

const meta: Meta<SpectrumProgressBarProps> = {
  title: 'ProgressBar',
  component: ProgressBar
};

export default meta;

const grayedBoxStyle: CSSProperties = {
  width: '250px',
  height: '60px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const Template = (): Story<SpectrumProgressBarProps> => (args) => (
  <ProgressBar {...args} />
);


export const Default = Template().bind({});
Default.args = {label: 'Progress label', value: 50};

export const SizeS = Template().bind({});
SizeS.args = {...Default.args, size: 'S'};

export const ShowValueLabelFalse = Template().bind({});
ShowValueLabelFalse.args = {...Default.args, showValueLabel: false};

export const LabelPositionSide = Template().bind({});
LabelPositionSide.args = {...Default.args, labelPosition: 'side'};

export const OverBackground = Template().bind({});
OverBackground.args = {...Default.args, variant: 'overBackground'};
OverBackground.decorators = [(Story) => <div style={grayedBoxStyle}><Story /></div>];

export const Value0 = Template().bind({});
Value0.args = {...Default.args, value: 0};

export const Value100 = Template().bind({});
Value100.args = {...Default.args, value: 100};
