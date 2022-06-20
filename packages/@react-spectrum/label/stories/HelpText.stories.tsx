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
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React, {useState} from 'react';
import {SpectrumTextFieldProps} from '@react-types/textfield';
import {TextField} from '@react-spectrum/textfield';

type HelpTextStory = ComponentStoryObj<typeof TextField>;

const argTypes = {
  label: {
    control: 'text'
  },
  description: {
    control: 'text'
  },
  errorMessage: {
    control: 'text',
    defaultValue: 'Create a password with at least 8 characters.'
  },
  validationState: {
    control: 'radio',
    defaultValue: 'valid',
    options: ['invalid', 'valid', undefined]
  },
  isDisabled: {
    control: 'boolean',
    defaultValue: false
  },
  labelAlign: {
    control: 'radio',
    defaultValue: 'start',
    options: ['end', 'start']
  },
  labelPosition: {
    control: 'radio',
    defaultValue: 'top',
    options: ['side', 'top']
  },
  width: {
    control: 'radio',
    defaultValue: 'top',
    options: ['100px', '440px', 'var(--spectrum-global-dimension-top, var(--spectrum-alias-top))']
  }
};

export default {
  title: 'HelpText',
  component: TextField,
  args: {
    label: 'Password',
    description: 'Password must be at least 8 characters.'
  },
  argTypes: argTypes
} as ComponentMeta<typeof TextField>;

export let Default: HelpTextStory = {};

export let WithState: HelpTextStory = {
  args: {
    label: 'Empty field',
    description: 'This input is only valid when it\'s empty.',
    errorMessage: 'Remove input.'
  },
  argTypes: {validationState: {control: {disable: true}}},
  render: (props) => <TextFieldWithValidationState {...props} />
};

export let AriaLabel: HelpTextStory = {
  args: {
    label: null,
    'aria-label': 'Password'
  },
  argTypes: {
    label: {
      control: {disable: true}
    },
    'aria-label': {
      control: 'text'
    }
  }
};

export const DescriptionAndCustomDescription = {
  args: {
    customDescription: 'Custom description.',
    'aria-describedby': 'custom-description'
  },
  argTypes: {
    customDescription: {
      control: 'text'
    },
    'aria-describedby': {control: {disable: true}}
  },
  decorators: [(Story, Context) => (
    <Flex direction="column" gap="size-125">
      <Story />
      <p id={Context.args['aria-describedby']}>{Context.args.customDescription}</p>
    </Flex>
  )]
};

function TextFieldWithValidationState(props: SpectrumTextFieldProps) {
  let [value, setValue] = useState('');
  let [valid, setValid] = useState(undefined);

  return (
    <Flex
      direction="column"
      gap="size-200">
      <TextField
        {...props}
        value={value}
        onChange={setValue}
        validationState={value.length ? 'invalid' : valid} />
      <RadioGroup
        label="Valid State"
        value={valid ? valid : ''}
        onChange={setValid}>
        <Radio value="valid">Valid</Radio>
        <Radio value="">undefined</Radio>
      </RadioGroup>
    </Flex>
  );
}
