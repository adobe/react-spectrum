/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import {SpectrumTextFieldProps} from '@react-types/textfield';
import {TextField} from '@react-spectrum/textfield';

export default {
  title: 'HelpText',
  parameters: {
    providerSwitcher: {status: 'positive'}
  }
};

export const Description = () =>
  render({description: 'Password must be at least 8 characters.'});

Description.story = {
  name: 'description'
};

export const ErrorMessage = () =>
  render({
    errorMessage: 'Create a password with at least 8 characters.',
    validationState: 'invalid'
  });

ErrorMessage.story = {
  name: 'error message'
};

export const Disabled = () =>
  render({
    description: 'Password must be at least 8 characters.',
    isDisabled: true
  });

Disabled.story = {
  name: 'disabled'
};

export const LabelAlignEnd = () =>
  render({
    description: 'Password must be at least 8 characters.',
    labelAlign: 'end'
  });

LabelAlignEnd.story = {
  name: 'labelAlign: end'
};

export const LabelPositionSide = () =>
  render({
    description: 'Password must be at least 8 characters.',
    labelPosition: 'side'
  });

LabelPositionSide.story = {
  name: 'labelPosition: side'
};

export const NoVisibleLabel = () =>
  render({
    label: null,
    'aria-label': 'Password',
    description: 'Password must be at least 8 characters.'
  });

NoVisibleLabel.story = {
  name: 'no visible label'
};

export const CustomWidth = () =>
  render({
    label: 'Password',
    description: 'Password must be at least 8 characters.',
    width: '100px'
  });

CustomWidth.story = {
  name: 'custom width'
};

export const CustomWidthLabelPositionSide = () =>
  render({
    label: 'Password',
    description: 'Password must be at least 8 characters.',
    width: '440px',
    labelPosition: 'side'
  });

CustomWidthLabelPositionSide.story = {
  name: 'custom width, labelPosition: side'
};

function render(props: SpectrumTextFieldProps = {}) {
  return <TextField label="Password" {...props} />;
}
