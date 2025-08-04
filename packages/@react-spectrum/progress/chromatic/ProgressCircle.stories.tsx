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

import {Meta, StoryObj} from '@storybook/react';
import {ProgressCircle} from '../';
import React, {CSSProperties} from 'react';
import {SpectrumProgressCircleProps} from '@react-types/progress';

const meta: Meta<SpectrumProgressCircleProps> = {
  title: 'ProgressCircle',
  component: ProgressCircle
};

export default meta;

export type ProgressCircleStory = StoryObj<typeof ProgressCircle>;

const grayedBoxStyle: CSSProperties = {
  width: '250px',
  height: '60px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const Default: ProgressCircleStory = {
  args: {value: 50}
};

export const SizeS: ProgressCircleStory = {
  args: {...Default.args, size: 'S'}
};

export const SizeL: ProgressCircleStory = {
  args: {...Default.args, size: 'L'}
};

export const OverBackground: ProgressCircleStory = {
  args: {...Default.args, variant: 'overBackground'},
  decorators: [
    (Story) => (
      <div style={grayedBoxStyle}>
        <Story />
      </div>
    )
  ]
};

export const StaticColorWhite: ProgressCircleStory = {
  args: {...Default.args, staticColor: 'white'},
  decorators: [
    (Story) => (
      <div style={grayedBoxStyle}>
        <Story />
      </div>
    )
  ]
};

export const StaticColorBlack: ProgressCircleStory = {
  args: {...Default.args, staticColor: 'black'},
  decorators: [
    (Story) => (
      <div style={{...grayedBoxStyle, backgroundColor: 'rgb(206, 247, 243)'}}>
        <Story />
      </div>
    )
  ]
};

export const Value0: ProgressCircleStory = {
  args: {...Default.args, value: 0}
};

export const Value100: ProgressCircleStory = {
  args: {...Default.args, value: 100}
};
