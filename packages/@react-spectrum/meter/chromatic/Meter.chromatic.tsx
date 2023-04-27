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

import {Meta} from '@storybook/react';
import {Meter} from '../';
import {SpectrumMeterProps} from '@react-types/meter';

const meta: Meta<SpectrumMeterProps> = {
  title: 'Meter',
  component: Meter
};

export default meta;

export const Default = {
  args: {label: 'Meter label', value: 50, variant: 'positive'}
};

export const SizeS = {
  args: {...Default.args, size: 'S'}
};

export const ShowValueLabelFalse = {
  args: {...Default.args, showValueLabel: false}
};

export const LabelPositionSide = {
  args: {...Default.args, labelPosition: 'side'}
};

export const Critical = {
  args: {...Default.args, variant: 'critical'}
};

export const Warning = {
  args: {...Default.args, variant: 'warning'}
};

export const Value0 = {
  args: {...Default.args, value: 0}
};

export const Value100 = {
  args: {...Default.args, value: 100}
};
