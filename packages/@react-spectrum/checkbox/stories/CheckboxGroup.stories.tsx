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

import {action} from '@storybook/addon-actions';
import {Checkbox, CheckboxGroup} from '../';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content, ContextualHelp, Flex, Heading} from '@adobe/react-spectrum';
import React, {useState} from 'react';
import {SpectrumCheckboxGroupProps} from '@react-types/checkbox';

export type CheckboxGroupStory = ComponentStoryObj<typeof CheckboxGroup>;

export default {
  title: 'CheckboxGroup',
  component: CheckboxGroup,
  args: {
    label: 'Pets',
    onChange: action('onChange')
  },
  argTypes: {
    onChange: {
      table: {
        disable: true
      }
    },
    contextualHelp: {
      table: {
        disable: true
      }
    },
    defaultValue: {
      table: {
        disable: true
      }
    },
    value: {
      table: {
        disable: true
      }
    },
    isEmphasized: {
      control: 'boolean'
    },
    isDisabled: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    isRequired: {
      control: 'boolean'
    },
    necessityIndicator: {
      control: 'select',
      options: ['icon', 'label']
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'side']
    },
    labelAlign: {
      control: 'select',
      options: ['start', 'end']
    },
    isInvalid: {
      control: 'boolean'
    },
    description: {
      control: 'text'
    },
    errorMessage: {
      control: 'text'
    },
    showErrorIcon: {
      control: 'boolean'
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical']
    },
    'aria-label': {
      control: 'text'
    },
    name: {
      control: 'text'
    }
  }
} as ComponentMeta<typeof CheckboxGroup>;

export const Default: CheckboxGroupStory = {
  render: (args) => render(args)
};

export const DefaultValue: CheckboxGroupStory = {
  ...Default,
  args: {defaultValue: ['dragons']},
  name: 'defaultValue: dragons'
};

export const ControlledValue: CheckboxGroupStory = {
  ...Default,
  args: {value: ['dragons']},
  name: 'controlled: dragons'
};

export const OneCheckboxDisabled: CheckboxGroupStory = {
  render: (args) => render(args, [{}, {isDisabled: true}, {}]),
  name: 'isDisabled on one checkbox'
};

export const TwoCheckboxDisabled: CheckboxGroupStory = {
  render: (args) => render({...args, defaultValue: ['dragons']}, [{}, {isDisabled: true}, {isDisabled: true}]),
  name: 'isDisabled two checkboxes and one checked'
};

export const OneInvalidCheckbox: CheckboxGroupStory = {
  render: (args) => render(args, [{}, {isInvalid: true}, {}]),
  name: 'validationState: "invalid" on one checkbox'
};

export const FixedWidth: CheckboxGroupStory = {
  render: (args) => renderWithDescriptionErrorMessageAndValidation(args),
  name: 'with description, error message and validation, fixed width'
};

export const ContextualHelpStory: CheckboxGroupStory = {
  ...Default,
  args: {
    contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )
  },
  name: 'contextual help'
};

export const AutoFocus: CheckboxGroupStory = {
  render: (args) => render(args, [{}, {autoFocus: true}, {}]),
  name: 'autoFocus on one checkbox'
};

export const ControlledGroup: CheckboxGroupStory = {
  render: (args) => <ControlledCheckboxGroup {...args} />,
  name: 'controlled'
};

function render(props: Omit<SpectrumCheckboxGroupProps, 'children'> = {}, checkboxProps: any[] = []) {
  return (
    <CheckboxGroup label="Pets" {...props}>
      <Checkbox value="dogs" {...checkboxProps[0]}>Dogs</Checkbox>
      <Checkbox value="cats" {...checkboxProps[1]}>Cats</Checkbox>
      <Checkbox value="dragons" {...checkboxProps[2]}>Dragons</Checkbox>
    </CheckboxGroup>
  );
}

function ControlledCheckboxGroup(props) {
  let [checked, setChecked] = useState<string[]>([]);
  let onChange = (value) => {
    setChecked(value);
    props?.onChange?.(value);
  };

  return (
    <CheckboxGroup label="Pets" {...props} onChange={onChange} value={checked}>
      <Checkbox value="dogs">Dogs</Checkbox>
      <Checkbox value="cats">Cats</Checkbox>
      <Checkbox value="dragons">Dragons</Checkbox>
    </CheckboxGroup>
  );
}

function renderWithDescriptionErrorMessageAndValidation(props) {
  function Example(props) {
    let [checked, setChecked] = useState<string[]>(['dogs', 'dragons']);
    let isValid = checked.length === 2 && checked.includes('dogs') && checked.includes('dragons');

    return (
      <Flex width="480px">
        <CheckboxGroup
          {...props}
          label="Pets"
          onChange={setChecked}
          value={checked}
          isInvalid={!isValid}
          description="Select a pet."
          errorMessage={
          checked.includes('cats')
            ? 'No cats allowed.'
            : 'Select only dogs and dragons.'
        }>
          <Checkbox value="dogs">Dogs</Checkbox>
          <Checkbox value="cats">Cats</Checkbox>
          <Checkbox value="dragons">Dragons</Checkbox>
        </CheckboxGroup>
      </Flex>
    );
  }

  return <Example {...props} />;
}
