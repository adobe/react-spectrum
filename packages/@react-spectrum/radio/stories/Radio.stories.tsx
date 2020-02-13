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
import {Provider} from '@react-spectrum/provider';
import {Radio, RadioGroup} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('RadioGroup', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'defaultValue: dragons',
    () => render({defaultValue: 'dragons'})
  )
  .add(
    'controlled: dragons',
    () => render({value: 'dragons'})
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
    'isDisabled on one radio',
    () => render({}, [{}, {isDisabled: true}, {}])
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
    'no visible label',
    () => render({label: null, 'aria-label': 'Favorite pet'})
  )
  .add(
    'long radio label',
    () => renderLongLabel({})
  )
  .add(
    'provider control: isDisabled',
    () => renderFormControl()
  )
  .add(
    'autoFocus on one radio',
    () => render({}, [{}, {autoFocus: true}, {}])
  );

function render(props, radioProps = [{}, {}, {}]) {
  return (
    <RadioGroup label="Favorite pet" {...props} onChange={action('onChange')} name="favorite-pet-group">
      <Radio value="dogs" {...radioProps[0]}>
        Dogs
      </Radio>
      <Radio value="cats" {...radioProps[1]}>
        Cats
      </Radio>
      <Radio value="dragons" {...radioProps[2]}>
        Dragons
      </Radio>
    </RadioGroup>
  );
}

function renderLongLabel(props, radioProps = [{}, {}, {}]) {
  return (
    <RadioGroup aria-label="Favorite pet" {...props} onChange={action('onChange')}>
      <Radio value="dogs" {...radioProps[0]}>
        Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs Dogs
      </Radio>
      <Radio value="cats" {...radioProps[1]}>
        Cats
      </Radio>
      <Radio value="dragons" {...radioProps[2]}>
        Dragons
      </Radio>
    </RadioGroup>
  );
}

function renderFormControl() {
  return (
    <Provider isDisabled>
      <RadioGroup aria-label="Favorite pet" onChange={action('onChangePet')} name="favorite-pet-group">
        <Radio value="dogs">
          Dogs
        </Radio>
        <Radio value="cats">
          Cats
        </Radio>
        <Radio value="dragons">
          Dragons
        </Radio>
      </RadioGroup>
      <RadioGroup aria-label="Favorite cereal" onChange={action('onChangeCereal')} name="favorite-cereal-group">
        <Radio value="reeses">
          Reese's Peanut Butter Puffs
        </Radio>
        <Radio value="honeynut">
          HoneyNut Cheerios
        </Radio>
        <Radio value="cinnamon">
          Cinnamon Toast Crunch
        </Radio>
      </RadioGroup>
    </Provider>
  );
}
