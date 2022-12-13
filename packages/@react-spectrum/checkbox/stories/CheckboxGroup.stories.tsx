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
import {Content, ContextualHelp, Heading} from '@adobe/react-spectrum';
import {Flex} from '@adobe/react-spectrum';
import React, {useState} from 'react';
import {SpectrumCheckboxGroupProps} from '@react-types/checkbox';
import {storiesOf} from '@storybook/react';

storiesOf('CheckboxGroup', module)
  .addParameters({
    providerSwitcher: {status: 'positive'},
    args: {
      label: 'Pets',
      isEmphasized: false,
      isDisabled: false,
      isReadOnly: false,
      isRequired: false,
      necessityIndicator: 'icon',
      labelPosition: 'top',
      labelAlign: 'start',
      validationState: null,
      orientation: 'vertical'
    },
    argTypes: {
      labelPosition: {
        control: {
          type: 'radio',
          options: ['top', 'side']
        }
      },
      necessityIndicator: {
        control: {
          type: 'radio',
          options: ['icon', 'label']
        }
      },
      labelAlign: {
        control: {
          type: 'radio',
          options: ['start', 'end']
        }
      },
      validationState: {
        control: {
          type: 'radio',
          options: [null, 'valid', 'invalid']
        }
      },
      orientation: {
        control: {
          type: 'radio',
          options: ['horizontal', 'vertical']
        }
      }
    }
  })
  .add(
    'Default',
    args => render(args)
  )
  .add(
    'defaultValue: dragons',
    args => render({...args, defaultValue: ['dragons']})
  )
  .add(
    'controlled: dragons',
    args => render({...args, value: ['dragons']})
  )
  .add(
    'isDisabled on one checkbox',
    () => render({}, [{}, {isDisabled: true}, {}])
  )
  .add(
    'isDisabled two checkboxes and one checked',
    args => render({...args, defaultValue: ['dragons']}, [{}, {isDisabled: true}, {isDisabled: true}])
  )
  .add(
    'isEmphasized, isDisabled two checkboxes and one checked',
    args => render({...args, isEmphasized: true, defaultValue: ['dragons']}, [{}, {isDisabled: true}, {isDisabled: true}])
  )
  .add(
    'validationState: "invalid" on one checkbox',
    args => render(args, [{}, {validationState: 'invalid'}, {}])
  )
  .add(
    'with description',
    args => render({...args, description: 'Please select some pets.'})
  )
  .add(
    'with error message',
    args => render({...args, errorMessage: 'Please select a valid combination of pets.', validationState: 'invalid'})
  )
  .add(
    'with error message and error icon',
    args => render({...args, errorMessage: 'Please select a valid combination of pets.', validationState: 'invalid', showErrorIcon: true})
  )
  .add(
    'with description, error message and validation, fixed width',
    () => renderWithDescriptionErrorMessageAndValidation()
  )
  .add(
    'contextual help',
    args => render({
      ...args,
      contextualHelp: (
        <ContextualHelp>
          <Heading>What is a segment?</Heading>
          <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
        </ContextualHelp>
      )
    })
  )
  .add(
    'no visible label',
    args => render({...args, label: null, 'aria-label': 'Pets'})
  )
  .add(
    'autoFocus on one checkbox',
    args => render(args, [{}, {autoFocus: true}, {}])
  )
  .add(
    'form name',
    args => render({...args, name: 'pets'})
  )
  .add(
    'controlled',
    args => <ControlledCheckboxGroup {...args} />
  );

function render(props: Omit<SpectrumCheckboxGroupProps, 'children'> = {}, checkboxProps: any[] = []) {
  return (
    <CheckboxGroup label="Pets" {...props} onChange={action('onChange')}>
      <Checkbox value="dogs" {...checkboxProps[0]}>Dogs</Checkbox>
      <Checkbox value="cats" {...checkboxProps[1]}>Cats</Checkbox>
      <Checkbox value="dragons" {...checkboxProps[2]}>Dragons</Checkbox>
    </CheckboxGroup>
  );
}

function ControlledCheckboxGroup(props) {
  let [checked, setChecked] = useState<string[]>([]);
  return (
    <CheckboxGroup label="Pets" {...props} onChange={setChecked} value={checked}>
      <Checkbox value="dogs">Dogs</Checkbox>
      <Checkbox value="cats">Cats</Checkbox>
      <Checkbox value="dragons">Dragons</Checkbox>
    </CheckboxGroup>
  );
}

function renderWithDescriptionErrorMessageAndValidation() {
  function Example() {
    let [checked, setChecked] = useState<string[]>(['dogs', 'dragons']);
    let isValid = checked.length === 2 && checked.includes('dogs') && checked.includes('dragons');

    return (
      <Flex width="480px">
        <CheckboxGroup
          label="Pets"
          onChange={setChecked}
          value={checked}
          validationState={isValid ? 'valid' : 'invalid'}
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

  return <Example />;
}
