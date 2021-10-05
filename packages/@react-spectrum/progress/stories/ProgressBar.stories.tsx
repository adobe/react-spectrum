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

import {number, withKnobs} from '@storybook/addon-knobs';
import {ProgressBar} from '../';
import React, {CSSProperties} from 'react';

const sliderOptions = {
  range: true,
  min: 0,
  max: 100,
  step: 1
};

const formatOptions = {
  style: 'currency',
  currency: 'JPY'
};

const grayedBoxStyle: CSSProperties = {
  width: '250px',
  height: '60px',
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default {
  title: 'Progress/ProgressBar',
  decorators: [withKnobs],

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const Default = () => render();
export const Value50 = () => render({value: 50});

Value50.story = {
  name: 'value: 50'
};

export const Value100 = () => render({value: 100});

Value100.story = {
  name: 'value: 100'
};

export const SizeS = () => {
  const value = number('Value', 50, sliderOptions);
  return render({value, size: 'S'});
};

SizeS.story = {
  name: 'size: S'
};

export const ShowValueLabelTrue = () => {
  const value = number('Value', 32, sliderOptions);
  return render({showValueLabel: true, value});
};

ShowValueLabelTrue.story = {
  name: 'showValueLabel: true'
};

export const ShowValueLabelFalse = () => {
  const value = number('Value', 32, sliderOptions);
  return render({showValueLabel: false, value});
};

ShowValueLabelFalse.story = {
  name: 'showValueLabel: false'
};

export const ValueLabel1Of4 = () => render({value: 25, valueLabel: '1 of 4'});

ValueLabel1Of4.story = {
  name: 'valueLabel: 1 of 4'
};

export const UsingNumberFormatOptionsWithCurrencyStyle = () => {
  const value = number('Value', 60, sliderOptions);
  return render({
    showValueLabel: true,
    value,
    formatOptions
  });
};

UsingNumberFormatOptionsWithCurrencyStyle.story = {
  name: 'Using number formatOptions with currency style'
};

export const NoVisibleLabel = () => {
  const value = number('Value', 32, sliderOptions);
  return render({label: null, 'aria-label': 'Loading…', value});
};

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const LabelPositionSide = () => {
  const value = number('Value', 32, sliderOptions);
  return render({value, labelPosition: 'side'});
};

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const LabelPositionTop = () => {
  const value = number('Value', 32, sliderOptions);
  return render({value, labelPosition: 'top'});
};

LabelPositionTop.story = {
  name: 'labelPosition: top'
};

export const LongLabel = () => {
  const value = number('Value', 32, sliderOptions);
  return render({
    value,
    label: 'Super long progress bar label. Sample label copy. Loading...'
  });
};

LongLabel.story = {
  name: 'long label'
};

export const LongLabelLabelPositionSide = () => {
  const value = number('Value', 32, sliderOptions);
  return render({
    value,
    labelPosition: 'side',
    label: 'Super long progress bar label. Sample label copy. Loading...'
  });
};

LongLabelLabelPositionSide.story = {
  name: 'long label, labelPosition: side'
};

export const IsIndeterminateTrue = () => {
  const value = number('Value', 32, sliderOptions);
  return render({isIndeterminate: true, value});
};

IsIndeterminateTrue.story = {
  name: 'isIndeterminate: true'
};

export const IsIndeterminateTrueSizeS = () =>
  render({isIndeterminate: true, size: 'S'});

IsIndeterminateTrueSizeS.story = {
  name: 'isIndeterminate: true, size: S'
};

export const VariantOverBackground = () => {
  const value = number('Value', 32, sliderOptions);
  return (
    <div style={grayedBoxStyle}>
      {render({variant: 'overBackground', value})}
    </div>
  );
};

VariantOverBackground.story = {
  name: 'variant: overBackground'
};

export const ParentWidth100 = () => (
  <span style={{width: '100%'}}>{render()}</span>
);

ParentWidth100.story = {
  name: 'parent width 100%'
};

export const ParentWidth100Px = () => (
  <span style={{width: '100px'}}>{render()}</span>
);

ParentWidth100Px.story = {
  name: 'parent width 100px'
};

export const Width300Px = () => render({width: '300px', value: 100});

Width300Px.story = {
  name: 'width: 300px'
};

export const Width300PxIsIndeterminateTrue = () =>
  render({width: '300px', isIndeterminate: true});

Width300PxIsIndeterminateTrue.story = {
  name: 'width: 300px, isIndeterminate: true'
};

export const Width300PxLabelPositionSide = () =>
  render({width: '300px', labelPosition: 'side'});

Width300PxLabelPositionSide.story = {
  name: 'width: 300px, labelPosition: side'
};

export const Width300PxLabelPositionSideIsIndeterminateTrue = () =>
  render({width: '300px', labelPosition: 'side', isIndeterminate: true});

Width300PxLabelPositionSideIsIndeterminateTrue.story = {
  name: 'width: 300px, labelPosition: side, isIndeterminate: true'
};

export const Width30Px = () => render({width: '30px'});

Width30Px.story = {
  name: 'width: 30px'
};

export const Width30PxSizeS = () => render({width: '30px', size: 'S'});

Width30PxSizeS.story = {
  name: 'width: 30px, size: S'
};

export const Width30PxLabelPositionSideLongLabel = () =>
  render({
    width: '30px',
    labelPosition: 'side',
    label: 'Super long progress bar label. Sample label copy. Loading...'
  });

Width30PxLabelPositionSideLongLabel.story = {
  name: 'width: 30px, labelPosition: side, long label'
};

export const Width30PxLabelPositionSideIsIndeterminateTrueLongLabelButtonOnRight = () => (
  <>
    {render({
      width: '30px',
      labelPosition: 'side',
      isIndeterminate: true,
      label: 'Super long progress bar label. Sample label copy. Loading...'
    })}
    <button>Confirm</button>
  </>
);

Width30PxLabelPositionSideIsIndeterminateTrueLongLabelButtonOnRight.story = {
  name:
    'width: 30px, labelPosition: side, isIndeterminate: true, long label, button on right'
};

export const UsingRawValuesForMinValueMaxValueAndValue = () =>
  render({
    showValueLabel: true,
    labelPosition: 'top',
    maxValue: 2147483648,
    value: 715827883
  });

UsingRawValuesForMinValueMaxValueAndValue.story = {
  name: 'Using raw values for minValue, maxValue, and value'
};

export const UsingRawValuesWithNumberFormatter = () =>
  render({
    showValueLabel: true,
    labelPosition: 'top',
    maxValue: 2147483648,
    value: 715827883,
    formatOptions
  });

UsingRawValuesWithNumberFormatter.story = {
  name: 'Using raw values with number formatter'
};

function render(props: any = {}) {
  return <ProgressBar label="Loading…" {...props} />;
}
