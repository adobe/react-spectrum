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
import {Label} from '../';
import React from 'react';
import {SpectrumLabelProps} from '@react-types/label';
import {storiesOf} from '@storybook/react';
import {TextField} from '@react-spectrum/textfield';

storiesOf('Label', module)
  .addParameters({providerSwitcher: {status: "positive"}})
  .add(
    'Default',
    () => render({})
  )
  .add(
    'labelAlign: start',
    () => render({labelAlign: 'start', width: '100%'})
  )
  .add(
    'labelAlign: end',
    () => render({labelAlign: 'end', width: '100%'})
  )
  .add(
    'labelPosition: side, labelAlign: start',
    () => render({labelPosition: 'side', labelAlign: 'start', width: 80})
  )
  .add(
    'labelPosition: side, labelAlign: end',
    () => render({labelPosition: 'side', labelAlign: 'end', width: 80})
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'necessityIndicator: icon',
    () => render({isRequired: true, necessityIndicator: 'icon'})
  )
  .add(
    'necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'isRequired: false, necessityIndicator: label',
    () => render({isRequired: false, necessityIndicator: 'label'})
  );

function render(props: SpectrumLabelProps = {}) {
  return (
    <div style={{whiteSpace: 'nowrap'}}>
      <Label {...props} for="test">Test</Label>
      <TextField placeholder="React" id="test" isRequired={props.isRequired} />
    </div>
  );
}
