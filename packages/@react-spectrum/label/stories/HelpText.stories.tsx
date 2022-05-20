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
import { Flex } from '@react-spectrum/layout';
import React, { useState } from 'react';
import { SpectrumTextFieldProps } from '@react-types/textfield';
import { TextField } from '@react-spectrum/textfield';
export default {
  title: 'HelpText',
  parameters: {
    providerSwitcher: {
      status: 'positive',
    },
  },
};
export const Description = {
  render: () =>
    render({
      description: 'Password must be at least 8 characters.',
    }),
  name: 'description',
};
export const ErrorMessage = {
  render: () =>
    render({
      errorMessage: 'Create a password with at least 8 characters.',
      validationState: 'invalid',
    }),
  name: 'error message',
};
export const DescriptionAndErrorMessage = {
  render: () => {
    let [value, setValue] = useState('');
    return (
      <TextField
        label="Empty field"
        description="This input is only valid when it's empty."
        errorMessage="Remove input."
        value={value}
        onChange={setValue}
        validationState={value.length ? 'invalid' : undefined}
      />
    );
  },
  name: 'description and error message',
};
export const ErrorMessageWithNoDescription = {
  render: () => {
    let [value, setValue] = useState('');
    return (
      <TextField
        label="Empty field"
        errorMessage="Remove input."
        value={value}
        onChange={setValue}
        validationState={value.length ? 'invalid' : 'valid'}
      />
    );
  },
  name: 'error message with no description',
};
export const DescriptionValidationStateValid = {
  render: () =>
    render({
      label: 'Nickname',
      description: "Enter your nickname, or leave blank if you don't have one.",
      validationState: 'valid',
    }),
  name: 'description, validationState: valid',
};
export const DescriptionAndErrorMessageValidationStateValid = {
  render: () =>
    render({
      label: 'Valid field',
      description: 'The error message will never render because validationState is "valid".',
      errorMessage: 'Uninformative error message',
      // Won't render
      validationState: 'valid',
    }),
  name: 'description and error message, validationState: valid',
};
export const Disabled = {
  render: () =>
    render({
      description: 'Password must be at least 8 characters.',
      isDisabled: true,
    }),
  name: 'disabled',
};
export const LabelAlignEnd = {
  render: () =>
    render({
      description: 'Password must be at least 8 characters.',
      labelAlign: 'end',
    }),
  name: 'labelAlign: end',
};
export const LabelPositionSide = {
  render: () =>
    render({
      description: 'Password must be at least 8 characters.',
      labelPosition: 'side',
    }),
  name: 'labelPosition: side',
};
export const LabelAlignEndLabelPositionSide = {
  render: () =>
    render({
      description: 'Password must be at least 8 characters.',
      labelAlign: 'end',
      labelPosition: 'side',
    }),
  name: 'labelAlign: end, labelPosition: side',
};
export const NoVisibleLabel = {
  render: () =>
    render({
      label: null,
      'aria-label': 'Password',
      description: 'Password must be at least 8 characters.',
    }),
  name: 'no visible label',
};
export const NoVisibleLabelLabelPositionSide = {
  render: () =>
    render({
      label: null,
      'aria-label': 'Password',
      description: 'Password must be at least 8 characters.',
      labelPosition: 'side',
    }),
  name: 'no visible label, labelPosition: side',
};
export const CustomWidth = {
  render: () =>
    render({
      label: 'Password',
      description: 'Password must be at least 8 characters.',
      width: '100px',
    }),
  name: 'custom width',
};
export const CustomWidthLabelPositionSide = {
  render: () =>
    render({
      label: 'Password',
      description: 'Password must be at least 8 characters.',
      width: '440px',
      labelPosition: 'side',
    }),
  name: 'custom width, labelPosition: side',
};
export const DescriptionAndCustomDescription = {
  render: () =>
    renderCustomDescription({
      description: 'Password must be at least 8 characters.',
    }),
  name: 'description and custom description',
};
export const ContainerWithTextAlignmentSet = {
  render: () => (
    <Flex
      direction="column"
      gap="size-200"
      UNSAFE_style={{
        textAlign: 'center',
      }}
    >
      <TextField label="Password" description="Enter a single digit number." />
      <TextField
        label="Password 2"
        errorMessage="Create a password with at least 8 characters."
        validationState="invalid"
      />
    </Flex>
  ),
  name: 'container with text alignment set',
};

function render(props: SpectrumTextFieldProps = {}) {
  return <TextField label="Password" {...props} />;
}

function renderCustomDescription(props: SpectrumTextFieldProps = {}) {
  return (
    <Flex direction="column" gap="size-125">
      <TextField label="Password" {...props} aria-describedby="custom-description" />
      <p id="custom-description">Custom description.</p>
    </Flex>
  );
}
