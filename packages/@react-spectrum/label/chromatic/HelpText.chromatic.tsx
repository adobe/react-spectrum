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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';

type HelpTextStory = ComponentStoryObj<typeof TextField>;

export default {
  title: 'HelpText',
  component: TextField,
  args: {
    label: 'Password',
    description: 'Password must be at least 8 characters.'
  }
} as ComponentMeta<typeof TextField>;

export let Default: HelpTextStory = {
  name: 'description'
};

export const ErrorMessage = {
  ...Default,
  args: {
    errorMessage: 'Create a password with at least 8 characters.',
    validationState: 'invalid'
  },
  name: 'error message'
};

export const Disabled = {
  ...Default,
  args: {
    isDisabled: true
  },
  name: 'disabled'
};

export const LabelAlignEnd = {
  ...Default,
  args: {
    labelAlign: 'end'
  },
  name: 'labelAlign: end'
};

export const LabelPositionSide = {
  ...Default,
  args: {
    labelPosition: 'side'
  },
  name: 'labelPosition: side'
};

export const NoVisibleLabel = {
  ...Default,
  args: {
    label: null,
    'aria-label': 'Password'
  },
  name: 'no visible label'
};

export const CustomWidth = {
  ...Default,
  args: {
    width: '100px'
  },
  name: 'custom width'
};

export const CustomWidthLabelPositionSide = {
  ...Default,
  args: {
    width: '440px',
    labelPosition: 'side'
  },
  name: 'custom width, labelPosition: side'
};

export const ContainerWithTextAlignmentSetDescription = {
  args: {
    label: 'Password',
    description: 'Enter a single digit number'
  },
  name: 'textAlign center description',
  decorators: [TextAlignDecorator]
};

export const ContainerWithTextAlignmentSetError = {
  args: {
    label: 'Password',
    errorMessage: 'Create a password with at least 8 characters.',
    validationState: 'invalid'
  },
  name: 'textAlign center errorMessage',
  decorators: [TextAlignDecorator]
};

export const ContainerWithTextAlignmentSetDescriptionAndSetError = {
  args: {
    label: 'Password',
    errorMessage: 'Create a password with at least 8 characters.',
    validationState: 'invalid'
  },
  name: 'textAlign center errorMessage',
  decorators: [(Story) => (
    <Flex
      direction="column"
      gap="size-200"
      UNSAFE_style={{
        textAlign: 'center'
      }}>
      <TextField label="Username" description="Please use your email" />
      <Story />
    </Flex>
  )]
};

function TextAlignDecorator(Story) {
  return (
    <Flex
      direction="column"
      gap="size-200"
      UNSAFE_style={{
        textAlign: 'center'
      }}>
      <Story />
    </Flex>
  );
}
