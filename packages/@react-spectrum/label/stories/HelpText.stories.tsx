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
import React, {useState} from 'react';
import {SpectrumTextFieldProps} from '@react-types/textfield';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';

storiesOf('HelpText', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'description',
    () => render({description: 'Password must be at least 8 characters.'})
  )
  .add(
    'error message',
    () => render({errorMessage: 'Create a password with at least 8 characters.', validationState: 'invalid'})
  )
  .add(
    'description and error message',
    () => {
      let [value, setValue] = useState('');

      return (
        <TextField
          label="Empty field"
          description="This input is only valid when it's empty."
          errorMessage="Please remove your input."
          value={value}
          onChange={setValue}
          validationState={value.length ? 'invalid' : undefined} />
      );
    }
  )
  .add(
    'description and error message, validationState: valid',
    () => render({
      description: 'Password must be at least 8 characters.',
      errorMessage: 'Create a password with at least 8 characters.', // Won't render
      validationState: 'valid'
    })
  )
  .add(
    'showIcon: true',
    () => render({
      errorMessage: 'Create a password with at least 8 characters.',
      validationState: 'invalid',
      showIcon: true
    })
  )
  .add(
    'disabled',
    () => render({description: 'Password must be at least 8 characters.', isDisabled: true})
  )
  .add(
    'no visible label',
    () => render({
      label: null,
      'aria-label': 'Password',
      description: 'Password must be at least 8 characters.'
    })
  )
  .add(
    'description and custom description',
    () => renderCustomDescription({description: 'Password must be at least 8 characters.'})
  );

function render(props: SpectrumTextFieldProps = {}) {
  return (
    <TextField label="Password" {...props} />
  );
}

function renderCustomDescription(props: SpectrumTextFieldProps = {}) {
  return (
    <Flex direction="column" gap="size-125">
      <TextField label="Password" {...props} aria-describedby="custom-description" />
      <p id="custom-description">Custom description.</p>
    </Flex>
  );
}
