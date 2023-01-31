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
import {Content, ContextualHelp, Heading} from '@adobe/react-spectrum';
import Info from '@spectrum-icons/workflow/Info';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextField} from '../';

storiesOf('TextField', module)
  .addParameters({
    providerSwitcher: {status: 'positive'},
    args: {
      label: 'Street address',
      isQuiet: false,
      isDisabled: false,
      isReadOnly: false,
      isRequired: false,
      necessityIndicator: 'icon',
      labelPosition: 'top',
      labelAlign: 'start',
      validationState: null
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
      }
    }
  })
  .add(
    'Default',
    args => render(args)
  )
  .add(
    'value: Test (controlled)',
    args => render({...args, value: 'Test'})
  )
  .add(
    'defaultValue: Test (uncontrolled)',
    args => render({...args, defaultValue: 'Test'})
  )
  .add(
    'type: email',
    args => render({...args, type: 'email'})
  )
  .add(
    'pattern: [0-9]+',
    args => render({...args, pattern: '[0-9]+'})
  )
  .add(
    'autoFocus: true',
    args => render({...args, autoFocus: true})
  )
  .add(
    'icon: Info',
    args => render({...args, icon: <Info />})
  )
  .add(
    'no visible label',
    args => render({...args, label: null, 'aria-label': 'Street address'})
  )
  .add(
    'with description',
    args => render({...args, description: 'Please enter your street address.'})
  )
  .add(
    'with error message',
    args => render({...args, errorMessage: 'Please enter a valid street address.', validationState: 'invalid'})
  )
  .add(
    'with description, error message and validation',
    args => renderWithDescriptionErrorMessageAndValidation(args)
  )
  .add(
    'with contextual help',
    args => render({...args, contextualHelp: (
      <ContextualHelp>
        <Heading>What is a segment?</Heading>
        <Content>Segments identify who your visitors are, what devices and services they use, where they navigated from, and much more.</Content>
      </ContextualHelp>
    )})
  )
  .add('custom width',
    args => render({...args, icon: <Info />, validationState: 'invalid', width: '300px'})
  )
  .add('custom width small',
    args => render({...args, icon: <Info />, validationState: 'invalid', width: '30px'})
  );

function render(props = {}) {
  return (
    <TextField
      label="Street address"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      UNSAFE_className="custom_classname"
      {...props} />
  );
}

function renderWithDescriptionErrorMessageAndValidation(props) {
  function Example() {
    let [value, setValue] = React.useState('0');
    let isValid = React.useMemo(() => /^\d$/.test(value), [value]);

    return (
      <TextField
        {...props}
        validationState={isValid ? 'valid' : 'invalid'}
        value={value}
        onChange={setValue}
        label="Favorite number"
        maxLength={1}
        description="Enter a single digit number."
        errorMessage={
          value === ''
            ? 'Empty input not allowed.'
            : 'Single digit numbers are 0-9.'
        } />
    );
  }

  return <Example />;
}
