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
import { Label } from '../';
import React from 'react';
import { SpectrumLabelProps } from '@react-types/label';
import { TextField } from '@react-spectrum/textfield';
export default {
  title: 'Label',
  parameters: {
    providerSwitcher: {
      status: 'positive',
    },
  },
};
export const Default = () => render({});
export const LabelAlignStart = {
  render: () =>
    render({
      labelAlign: 'start',
      width: '100%',
    }),
  name: 'labelAlign: start',
};
export const LabelAlignEnd = {
  render: () =>
    render({
      labelAlign: 'end',
      width: '100%',
    }),
  name: 'labelAlign: end',
};
export const LabelPositionSideLabelAlignStart = {
  render: () =>
    render({
      labelPosition: 'side',
      labelAlign: 'start',
      width: 80,
    }),
  name: 'labelPosition: side, labelAlign: start',
};
export const LabelPositionSideLabelAlignEnd = {
  render: () =>
    render({
      labelPosition: 'side',
      labelAlign: 'end',
      width: 80,
    }),
  name: 'labelPosition: side, labelAlign: end',
};
export const IsRequired = {
  render: () =>
    render({
      isRequired: true,
    }),
  name: 'isRequired',
};
export const NecessityIndicatorIcon = {
  render: () =>
    render({
      isRequired: true,
      necessityIndicator: 'icon',
    }),
  name: 'necessityIndicator: icon',
};
export const NecessityIndicatorLabel = {
  render: () =>
    render({
      isRequired: true,
      necessityIndicator: 'label',
    }),
  name: 'necessityIndicator: label',
};
export const IsRequiredFalseNecessityIndicatorLabel = {
  render: () =>
    render({
      isRequired: false,
      necessityIndicator: 'label',
    }),
  name: 'isRequired: false, necessityIndicator: label',
};

function render(props: SpectrumLabelProps = {}) {
  return (
    <div
      style={{
        whiteSpace: 'nowrap',
      }}
    >
      <Label {...props} for="test">
        Test
      </Label>
      <TextField id="test" isRequired={props.isRequired} />
    </div>
  );
}
