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
import React, {useState} from 'react';
import {RadioGroup, Radio} from '@react-spectrum/radio';
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
  argTypes: argTypes
} as ComponentMeta<typeof TextField>;

export let Default: HelpTextStory = {
  args: {
    label: 'Password',
    description: 'Password must be at least 8 characters.'
  }
};

export let WithState: HelpTextStory = {
  args: {
    label: 'Empty field',
    description: 'This input is only valid when it\'s empty.',
    errorMessage: 'Remove input.'
  },
  argTypes: {validationState: {control: {disable: true}}},
  render: (props) => {
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
};

export let AriaLabel: HelpTextStory = {
  ...Default,
  args: {
    ...Default.args,
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
  ...Default,
  args: {
    ...Default.args,
    customDescription: 'Custom description.'
  },
  argTypes: {
    customDescription: {
      control: 'text'
    }
  },
  render: ({customDescription, ...props}) => (
    <Flex direction="column" gap="size-125">
      <TextField {...props} aria-describedby="custom-description" />
      <p id="custom-description">{customDescription}</p>
    </Flex>
  )
};
