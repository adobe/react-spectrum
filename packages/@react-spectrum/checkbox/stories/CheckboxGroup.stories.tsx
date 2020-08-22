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
import React from 'react';
import {SpectrumCheckboxGroupProps} from '@react-types/checkbox';
import {storiesOf} from '@storybook/react';

storiesOf('CheckboxGroup', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultValue: dragons',
    () => render({defaultValue: ['dragons']})
  )
  .add(
    'controlled: dragons',
    () => render({value: ['dragons']})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'labelAlign: end',
    () => render({labelAlign: 'end'})
  )
  .add(
    'horizontal',
    () => render({orientation: 'horizontal'})
  )
  .add(
    'horizontal, labelPosition: side',
    () => render({orientation: 'horizontal', labelPosition: 'side'})
  )
  .add(
    'horizontal, labelAlign: end',
    () => render({orientation: 'horizontal', labelAlign: 'end'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isDisabled on one checkbox',
    () => render({}, [{}, {isDisabled: true}, {}])
  )
  .add(
    'isDisabled on one checkbox horizontal',
    () => render({orientation: 'horizontal'}, [{}, {isDisabled: true}, {}])
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'validationState: "invalid"',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: "invalid" on one checkbox',
    () => render({}, [{}, {validationState: 'invalid'}, {}])
  )
  .add(
    'no visible label',
    () => render({label: null, 'aria-label': 'Pets'})
  )
  .add(
    'autoFocus on one checkbox',
    () => render({}, [{}, {autoFocus: true}, {}])
  )
  .add(
    'form name',
    () => render({name: 'pets'})
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
