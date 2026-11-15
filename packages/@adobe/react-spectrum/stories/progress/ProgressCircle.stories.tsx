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
import {ProgressCircle, SpectrumProgressCircleProps} from '../../src/progress/ProgressCircle';
import React, {CSSProperties} from 'react';

const grayedBoxStyle: CSSProperties = {
  width: '100px',
  height: '100px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default {
  title: 'Progress/ProgressCircle',
  providerSwitcher: {status: 'positive'},
  args: {value: 32},
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100
      }
    }
  }
} as Meta<SpectrumProgressCircleProps>;

export type ProgressCircleStory = StoryObj<SpectrumProgressCircleProps>;

export const Default: ProgressCircleStory = {
  render: args => render(args)
};
export const Value50: ProgressCircleStory = {
  render: () => render({value: 50}),
  name: 'value: 50'
};

export const Value100: ProgressCircleStory = {
  render: () => render({value: 100}),
  name: 'value: 100'
};

export const SizeS: ProgressCircleStory = {
  render: args => render({...args, size: 'S'}),
  name: 'size: S'
};

export const SizeL: ProgressCircleStory = {
  render: args => render({...args, size: 'L'}),
  name: 'size: L'
};

export const VariantOverBackground: ProgressCircleStory = {
  render: args => <div style={grayedBoxStyle}>{render({...args, variant: 'overBackground'})}</div>,
  name: 'variant: overBackground'
};

export const StaticColorWhite: ProgressCircleStory = {
  render: args => (
    <div style={{...grayedBoxStyle, backgroundColor: 'rgb(0, 119, 114)'}}>
      {render({...args, staticColor: 'white'})}
    </div>
  ),
  name: 'staticColor: white'
};

export const StaticColorBlack: ProgressCircleStory = {
  render: args => (
    <div style={{...grayedBoxStyle, backgroundColor: 'rgb(206, 247, 243)'}}>
      {render({...args, staticColor: 'black'})}
    </div>
  ),
  name: 'staticColor: black'
};

export const UsingRawValuesForMinValueMaxValueAndValue: ProgressCircleStory = {
  render: () =>
    render({
      labelPosition: 'top',
      maxValue: 2147483648,
      value: 715827883
    }),
  name: 'Using raw values for minValue, maxValue, and value'
};

export const IsIndeterminateTrue: ProgressCircleStory = {
  render: () => render({isIndeterminate: true}),
  name: 'isIndeterminate: true'
};

export const IsIndeterminateTrueSizeS: ProgressCircleStory = {
  render: () => render({isIndeterminate: true, size: 'S'}),
  name: 'isIndeterminate: true, size: S'
};

export const IsIndeterminateTrueSizeL: ProgressCircleStory = {
  render: () => render({isIndeterminate: true, size: 'L'}),
  name: 'isIndeterminate: true, size: L'
};

export const IsIndeterminateTrueVariantOverBackground: ProgressCircleStory = {
  render: () => (
    <div style={grayedBoxStyle}>{render({isIndeterminate: true, variant: 'overBackground'})}</div>
  ),
  name: 'isIndeterminate: true, variant: overBackground'
};

function render(props = {}) {
  return <ProgressCircle aria-label="Loading…" {...props} />;
}
