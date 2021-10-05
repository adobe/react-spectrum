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

import {Meter} from '../';
import {number, withKnobs} from '@storybook/addon-knobs';
import React from 'react';

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

export default {
  title: 'Meter',
  decorators: [withKnobs],

  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

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
  return render({label: null, 'aria-label': 'Meter', value});
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

export const VariantPositive = () => {
  const value = number('Value', 32, sliderOptions);
  return render({variant: 'positive', value});
};

VariantPositive.story = {
  name: 'variant: positive'
};

export const VariantCritical = () => {
  const value = number('Value', 32, sliderOptions);
  return render({variant: 'critical', value});
};

VariantCritical.story = {
  name: 'variant: critical'
};

export const VariantWarning = () => {
  const value = number('Value', 32, sliderOptions);
  return render({variant: 'warning', value});
};

VariantWarning.story = {
  name: 'variant: warning'
};

export const ParentWidth100 = () => (
  <span style={{width: '100%'}}>{render({value: 32})}</span>
);

ParentWidth100.story = {
  name: 'parent width 100%'
};

export const ParentWidth100Px = () => (
  <span style={{width: '100px'}}>{render({value: 32})}</span>
);

ParentWidth100Px.story = {
  name: 'parent width 100px'
};

export const Width300Px = () => render({value: 32, width: '300px'});

Width300Px.story = {
  name: 'width: 300px'
};

export const Width300PxLabelPositionSide = () =>
  render({value: 32, width: '300px', labelPosition: 'side'});

Width300PxLabelPositionSide.story = {
  name: 'width: 300px, labelPosition: side'
};

export const Width30Px = () => render({value: 32, width: '30px'});

Width30Px.story = {
  name: 'width: 30px'
};

export const Width30PxLabelPositionSide = () =>
  render({value: 32, width: '30px', labelPosition: 'side'});

Width30PxLabelPositionSide.story = {
  name: 'width: 30px, labelPosition: side'
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
  return <Meter label="Meter" variant="positive" {...props} />;
}
