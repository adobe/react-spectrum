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
import {Flex} from '@react-spectrum/layout';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';

export default {
  title: 'HelpText',
  component: TextField,
  args: {
    label: 'Password',
    description: 'Password must be at least 8 characters.'
  }
} as Meta<typeof TextField>;

export type HelpTextStory = StoryObj<typeof TextField>;

export const Default: HelpTextStory = {
  name: 'description'
};

export const ErrorMessage: HelpTextStory = {
  ...Default,
  args: {
    errorMessage: 'Create a password with at least 8 characters.',
    validationState: 'invalid'
  },
  name: 'error message'
};

export const Disabled: HelpTextStory = {
  ...Default,
  args: {
    isDisabled: true
  },
  name: 'disabled'
};

export const LabelAlignEnd: HelpTextStory = {
  ...Default,
  args: {
    labelAlign: 'end'
  },
  name: 'labelAlign: end'
};

export const LabelPositionSide: HelpTextStory = {
  ...Default,
  args: {
    labelPosition: 'side'
  },
  name: 'labelPosition: side'
};

export const NoVisibleLabel: HelpTextStory = {
  ...Default,
  args: {
    label: null,
    'aria-label': 'Password'
  },
  name: 'no visible label'
};

export const CustomWidth: HelpTextStory = {
  ...Default,
  args: {
    width: '100px'
  },
  name: 'custom width'
};

export const CustomWidthLabelPositionSide: HelpTextStory = {
  ...Default,
  args: {
    width: '440px',
    labelPosition: 'side'
  },
  name: 'custom width, labelPosition: side'
};

export const ContainerWithTextAlignmentSetDescription: HelpTextStory = {
  args: {
    label: 'Password',
    description: 'Enter a single digit number'
  },
  name: 'textAlign center description',
  decorators: [TextAlignDecorator]
};

export const ContainerWithTextAlignmentSetError: HelpTextStory = {
  args: {
    label: 'Password',
    errorMessage: 'Create a password with at least 8 characters.',
    validationState: 'invalid'
  },
  name: 'textAlign center errorMessage',
  decorators: [TextAlignDecorator]
};

export const ContainerWithTextAlignmentSetDescriptionAndSetError: HelpTextStory = {
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
