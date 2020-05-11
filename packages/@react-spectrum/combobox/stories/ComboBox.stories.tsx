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
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {ComboBox, Item, Section} from '../';
import Copy from '@spectrum-icons/workflow/Copy';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';

let items = [
  {name: 'Aardvark', id: '1'},
  {name: 'Kangaroo', id: '2'},
  {name: 'Snake', id: '3'}
];

let withSection = [
  {name: 'Animals', children: [
    {name: 'Aardvark'},
    {name: 'Kangaroo'},
    {name: 'Snake'}
  ]},
  {name: 'People', children: [
    {name: 'Danni'},
    {name: 'Devon'},
    {name: 'Ross', children: [
      {name: 'Tests'}
    ]}
  ]}
];

storiesOf('ComboBox', module)
  .add(
    'no items',
    () => (
      <ComboBox items={[]} itemKey="id" label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'static items',
    () => render({})
  )
  // TODO: figure out why item needs a :any here
  .add(
    'dynamic items',
    () => (
      <ComboBox items={items} itemKey="id" label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  // TODO: figure out why item needs a :any here
  .add(
    'with sections',
    () => (
      <ComboBox items={withSection} itemKey="name" label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    )
  )
  .add(
    'user provided id and label',
    () => (
      <div>
        <label id="test-label" htmlFor="test-id">Combobox</label>
        <ComboBox id="test-id" aria-labelledby="test-label" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
          <Item uniqueKey="one">Item One</Item>
          <Item uniqueKey="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item uniqueKey="three">Item Three</Item>
        </ComboBox>
      </div>
    )
  )
  .add(
    'menuTrigger: focus',
    () => render({menuTrigger: 'focus'})
  )
  .add(
    'menuTrigger: manual',
    () => render({menuTrigger: 'manual'})
  )
  // TODO: add a line of text in the story indicating that you need focus to make combobox menu display
  .add(
    'isOpen',
    () => render({isOpen: true})
  )
  // TODO: add a line of text in the story indicating that you need focus to make combobox menu display
  .add(
    'defaultOpen',
    () => render({defaultOpen: true})
  )
  .add(
    'inputValue (controlled)',
    () => render({inputValue: 'Item'})
  )
  .add(
    'defaultInputValue (uncontrolled)',
    () => render({defaultInputValue: 'Item'})
  )
  .add(
    'selectedKey (controlled)',
    () => (
      <ControlledKeyComboBox selectedKey="Kangaroo" />
    )
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
    () => (
      <ControlledKeyComboBox defaultInputValue="Blah" selectedKey="Kangaroo" />
    )
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
    () => render({validationState: 'invalid', defaultSelectedKey: 'two'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid', defaultSelectedKey: 'two'})
  )
  .add(
    'autoFocus: true',
    () => render({autoFocus: true})
  )
  .add(
    'direction: top',
    () => render({direction: 'top'})
  )
  .add(
    'allowsCustomValue: true',
    () => render({allowsCustomValue: true})
  )
  .add(
    'customWidth',
    () => (
      <Flex flexDirection="column">
        <ComboBox label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} width="200px">
          <Item uniqueKey="one">Item One</Item>
          <Item uniqueKey="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item uniqueKey="three">Item Three</Item>
        </ComboBox>
        <ComboBox label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} width="800px">
          <Item uniqueKey="one">Item One</Item>
          <Item uniqueKey="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item uniqueKey="three">Item Three</Item>
        </ComboBox>
      </Flex>
    )
  )
  .add(
    'onFilter, (value included in list)',
    () => (
      <CustomFilterComboBox />
    )
  );

let customFilterItems = [
  {name: 'The first item', id: '1'},
  {name: 'The second item', id: '2'},
  {name: 'The third item', id: '3'}
];

let CustomFilterComboBox = () => {
  let [list, setList] = React.useState(customFilterItems);

  let onFilter = (value) => {
    setList(customFilterItems.filter(item => item.name.includes(value)));
  };

  return (
    <ComboBox items={list} itemKey="id" label="Combobox" onFilter={onFilter} onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
      {(item: any) => <Item>{item.name}</Item>}
    </ComboBox>
  );
};

let ControlledKeyComboBox = (props) => {
  let [selectedKey, setSelectedKey] = React.useState(props.selectedKey);
  
  let onSelectionChange = (key) => {
    setSelectedKey(key);
  };

  return (
    <div>
      <ButtonGroup marginEnd="30px">
        <Button variant="secondary" onPress={() => setSelectedKey('Snake')}>
          <Text>Snake</Text>
        </Button>
        <Button variant="secondary" onPress={() => setSelectedKey('Ross')}>
          <Text>Ross</Text>
        </Button>
      </ButtonGroup>
      <ComboBox {...props} selectedKey={selectedKey} items={withSection} itemKey="name" label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
};

function render(props = {}) {
  return (
    <ComboBox label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')} {...props}>
      <Item uniqueKey="one">Item One</Item>
      <Item uniqueKey="two" textValue="Item Two">
        <Copy size="S" />
        <Text>Item Two</Text>
      </Item>
      <Item uniqueKey="three">Item Three</Item>
    </ComboBox>
  );
}
