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

import {countries, states} from './data';
import {Flex} from '@react-spectrum/layout';
import {Form} from '../';
import {Item, Picker} from '@react-spectrum/picker';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {TextArea, TextField} from '@react-spectrum/textfield';
import {ButtonGroup} from "@react-spectrum/buttongroup";
import {Button} from "@react-spectrum/button";
import {action} from "@storybook/addon-actions";
import {Checkbox} from "@react-spectrum/checkbox";

storiesOf('Form', module)
  .addParameters({providerSwitcher: {status: 'positive'}})
  .add(
    'Default',
    () => render({})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'custom width',
    () => render({width: 400})
  )
  .add(
    'custom width, labelPosition: side',
    () => render({width: 400, labelPosition: 'side'})
  )
  .add(
    'labelAlign: end',
    () => render({width: 400, labelAlign: 'end'})
  )
  .add(
    'labelPosition: side, labelAlign: end',
    () => render({width: 400, labelPosition: 'side', labelAlign: 'end'})
  )
  .add(
    'fields next to each other',
    () => (
      <Form onSubmit={e => e.preventDefault()}>
        <Flex>
          <TextField label="First Name" placeholder="John" marginEnd="size-100" flex={1} />
          <TextField label="Last Name" placeholder="Smith" flex={1} />
        </Flex>
        <TextField label="Street Address" placeholder="123 Any Street" />
        <Flex>
          <TextField label="City" placeholder="San Francisco" marginEnd="size-100" flex={1} />
          <Picker label="State" placeholder="Select a state" items={states} marginEnd="size-100" flex={1}>
            {item => <Item key={item.abbr}>{item.name}</Item>}
          </Picker>
          <TextField label="Zip code" placeholder="12345" flex={1} />
        </Flex>
      </Form>
    )
  )
  .add(
    'isRequired: true',
    () => render({isRequired: true})
  )
  .add(
    'isRequired: true, necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'isRequired: false, necessityIndicator: label',
    () => render({isRequired: false, necessityIndicator: 'label'})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isQuiet, labelPosition: side',
    () => render({isQuiet: true, labelPosition: 'side'})
  )
  .add(
    'isEmphasized',
    () => render({isEmphasized: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  );

function render(props: any = {}) {
  return (
    <Form
      onSubmit={e => {
        action('onSubmit')(e);
        e.preventDefault();
      }}
      onReset={action('onReset')}
      {...props}>
      <TextField label="First Name" placeholder="John" value="hello" />
      <TextField label="Last Name" placeholder="Smith" defaultValue="world" />
      <TextField label="Street Address" placeholder="123 Any Street" />
      <TextField label="City" placeholder="San Francisco" />
      <Picker label="State" placeholder="Select a state" items={states}>
        {item => <Item key={item.abbr}>{item.name}</Item>}
      </Picker>
      <TextField label="Zip code" placeholder="12345" />
      <Picker label="Country" placeholder="Select a country" items={countries}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Picker>
      <Checkbox defaultSelected>I am a wizard!</Checkbox>
      <Checkbox isSelected>I am a hunter!</Checkbox>
      <RadioGroup label="Favorite pet" name="favorite-pet-group" value="cats">
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
      <RadioGroup label="Favorite pet" name="favorite-pet-group2" defaultValue="cats">
        <Radio value="dogs">Dogs</Radio>
        <Radio value="cats">Cats</Radio>
        <Radio value="dragons">Dragons</Radio>
      </RadioGroup>
      <Picker label="Favorite color">
        <Item>Red</Item>
        <Item>Orange</Item>
        <Item>Yellow</Item>
        <Item>Green</Item>
        <Item>Blue</Item>
        <Item>Purple</Item>
      </Picker>
      <TextArea label="Comments" placeholder="How do you feel?" value="hello" />
      <TextArea label="Comments" placeholder="How do you feel?" defaultValue="hello" />
      <ButtonGroup>
        <Button variant="secondary" type="reset">Reset</Button>
        <Button variant="primary" type="submit">Submit</Button>
      </ButtonGroup>
    </Form>
  );
}
