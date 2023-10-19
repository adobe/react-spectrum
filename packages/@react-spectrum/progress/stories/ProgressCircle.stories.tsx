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

import {ProgressCircle} from '../';
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
};

export const Default = (args) => render(args);
export const Value50 = () => render({value: 50});

Value50.story = {
  name: 'value: 50'
};

export const Value100 = () => render({value: 100});

Value100.story = {
  name: 'value: 100'
};

export const SizeS = (args) => render({...args, size: 'S'});

SizeS.story = {
  name: 'size: S'
};

export const SizeL = (args) => render({...args, size: 'L'});

SizeL.story = {
  name: 'size: L'
};

export const VariantOverBackground = (args) => (
  <div style={grayedBoxStyle}>{render({...args, variant: 'overBackground'})}</div>
);

VariantOverBackground.story = {
  name: 'variant: overBackground'
};

export const StaticColorWhite = (args) => (
  <div style={{...grayedBoxStyle, backgroundColor: 'rgb(0, 119, 114)'}}>{render({...args, staticColor: 'white'})}</div>
);

StaticColorWhite.story = {
  name: 'staticColor: white'
};

export const StaticColorBlack = (args) => (
  <div style={{...grayedBoxStyle, backgroundColor: 'rgb(206, 247, 243)'}}>{render({...args, staticColor: 'black'})}</div>
);

StaticColorBlack.story = {
  name: 'staticColor: black'
};

export const UsingRawValuesForMinValueMaxValueAndValue = () =>
  render({
    labelPosition: 'top',
    maxValue: 2147483648,
    value: 715827883
  });

UsingRawValuesForMinValueMaxValueAndValue.story = {
  name: 'Using raw values for minValue, maxValue, and value'
};

export const IsIndeterminateTrue = () => render({isIndeterminate: true});

IsIndeterminateTrue.story = {
  name: 'isIndeterminate: true'
};

export const IsIndeterminateTrueSizeS = () => render({isIndeterminate: true, size: 'S'});

IsIndeterminateTrueSizeS.story = {
  name: 'isIndeterminate: true, size: S'
};

export const IsIndeterminateTrueSizeL = () => render({isIndeterminate: true, size: 'L'});

IsIndeterminateTrueSizeL.story = {
  name: 'isIndeterminate: true, size: L'
};

export const IsIndeterminateTrueVariantOverBackground = () => (
  <div style={grayedBoxStyle}>{render({isIndeterminate: true, variant: 'overBackground'})}</div>
);

IsIndeterminateTrueVariantOverBackground.story = {
  name: 'isIndeterminate: true, variant: overBackground'
};

function render(props = {}) {
  return <ProgressCircle aria-label="Loading…" {...props} />;
}
