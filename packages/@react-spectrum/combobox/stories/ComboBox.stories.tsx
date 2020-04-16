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
    () => (
      <ComboBox label='bawe'>
        <Item uniqueKey="one">Item One</Item>
        <Item uniqueKey="two" textValue="Item Two">blah</Item>
      </ComboBox>
    )
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
    'isOpen',
    () => (
      <ComboBox isOpen>
        <Item uniqueKey="one">Item One</Item>
        <Item uniqueKey="two" textValue="Item Two">blah</Item>
      </ComboBox>
    )
  )
  .add(
    'defaultOpen',
    () => (
      <ComboBox defaultOpen>
        <Item uniqueKey="one">Item One</Item>
        <Item uniqueKey="two" textValue="Item Two">blah</Item>
      </ComboBox>
    )
  )
  .add(
    'isQuiet',
    () => (
      <ComboBox isQuiet>
        <Item uniqueKey="one">Item One</Item>
        <Item uniqueKey="two" textValue="Item Two">blah</Item>
      </ComboBox>
    )
  )
  .add(
    'isDisabled',
    () => (
      <ComboBox isDisabled>
        <Item uniqueKey="one">Item One</Item>
        <Item uniqueKey="two" textValue="Item Two">blah</Item>
      </ComboBox>
    )
  );

function render(props = {}) {
  return (
    <ComboBox {...props}>
    </ComboBox>
  );
}
