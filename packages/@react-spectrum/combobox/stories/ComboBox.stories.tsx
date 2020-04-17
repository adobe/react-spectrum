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
import {ComboBox, Item, Section} from '../';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';

// TODO: replace with ComboBoxItem and Section?


let items = [
  {name: 'Aardvark', id:'1'},
  {name: 'Kangaroo', id:'2'},
  {name: 'Snake', id:'3'}
];


storiesOf('ComboBox', module)
  .add(
    'static items',
    () => render({})
  )
  .add(
    'dynamic items',
    () => (
      <ComboBox items={items} itemKey="id" label="Combobox">
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'menuTrigger: manual',
    () => render({menuTrigger: 'manual'})
  )
  .add(
    'isOpen',
    () => render({isOpen: true})
  )
  .add(
    'defaultOpen',
    () => render({defaultOpen: true})
  )
  .add(
    'inputValue (controlled)',
    () => render({inputValue: 'controlled value'})
  )
  .add(
    'defaultInputValue (uncontrolled)',
    () => render({defaultInputValue: 'uncontrolled value'})
  )
  .add(
    'selectedKey (controlled)',
    () => render({selectedKey: 'two'})
  )
  .add(
    'defaultSelectedKey (uncontrolled)',
    () => render({defaultSelectedKey: 'two'})
  )
  .add(
    'inputValue and selectedKey (controlled)',
    () => render({inputValue: 'Item Two', selectedKey: 'two'})
  )
  .add(
    'defaultInputValue and defaultSelectedKey (uncontrolled)',
    () => render({defaultInputValue: 'Item Two', defaultSelectedKey: 'two'})
  )
  .add(
    'inputValue and defaultSelectedKey (controlled by inputvalue)',
    () => render({inputValue: 'Item One', defaultSelectedKey: 'two'})
  )
  .add(
    'defaultInputValue and selectedKey (controlled by selectedKey)',
    () => render({defaultInputValue: 'Item One', selectedKey: 'two'})
  )
  .add(
    'isQuiet',
    () => render({isQuiet: true})
  )
  .add(
    'isDisabled',
    () => render({isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({isReadOnly: true})
  )
  // TODO FIX THIS STORY, change spectrum field css width?
  .add(
    'labelPosition: top, labelAlign: end',
    () => render({labelAlign: 'end'})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'isRequired',
    () => render({isRequired: true})
  )
  .add(
    'isRequired, necessityIndicator: label',
    () => render({isRequired: true, necessityIndicator: 'label'})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  )
  .add(
    'autoFocus: true',
    () => render({autoFocus: true})
  )
  .add(
    'customWidth',
    () => (
      <Flex flexDirection="column">
        <ComboBox label='Combobox' onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} width="200px">
          <Item uniqueKey="one">Item One</Item>
          <Item uniqueKey="two" textValue="Item Two">Custom Item</Item>
          <Item uniqueKey="three">Item Three</Item>
        </ComboBox>
        <ComboBox label='Combobox' onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} width="800px">
          <Item uniqueKey="one">Item One</Item>
          <Item uniqueKey="two" textValue="Item Two">Custom Item</Item>
          <Item uniqueKey="three">Item Three</Item>
        </ComboBox>
      </Flex>
    )
  );

function render(props = {}) {
  return (
    <ComboBox label='Combobox' onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} {...props}>
      <Item uniqueKey="one">Item One</Item>
      <Item uniqueKey="two" textValue="Item Two">Custom Item</Item>
      <Item uniqueKey="three">Item Three</Item>
    </ComboBox>
  );
}
