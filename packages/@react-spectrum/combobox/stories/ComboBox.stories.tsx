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
import {Text} from '@react-spectrum/text';

let items = [
  {name: 'Aardvark', id: '1'},
  {name: 'Kangaroo', id: '2'},
  {name: 'Snake', id: '3'}
];

let withSection = [
  {name: 'Animals', id: 's1', children: [
    {name: 'Aardvark', id: '1'},
    {name: 'Kangaroo', id: '2'},
    {name: 'Snake', id: '3'}
  ]},
  {name: 'People', id: 's2', children: [
    {name: 'Danni', id: '4'},
    {name: 'Devon', id: '5'},
    {name: 'Ross', id: '6'}
  ]}
];

let lotsOfSections: any[] = [];
for (let i = 0; i < 50; i++) {
  let children = [];
  for (let j = 0; j < 50; j++) {
    children.push({name: `Section ${i}, Item ${j}`});
  }

  lotsOfSections.push({name: 'Section ' + i, children});
}

let actions = {
  onOpenChange: action('onOpenChange'),
  onInputChange: action('onInputChange'),
  onSelectionChange: action('onSelectionChange'),
  onBlur: action('onBlur'),
  onFocus: action('onFocus'),
  onCustomValue: action('onCustomValue')
};

storiesOf('ComboBox', module)
  .add(
    'no items',
    () => (
      <ComboBox items={[]} label="Combobox" {...actions}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'static items',
    () => render({})
  )
  .add(
    'dynamic items',
    () => (
      <ComboBox items={items} label="Combobox" {...actions}>
        {(item) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'with sections',
    () => (
      <ComboBox items={withSection} label="Combobox" {...actions}>
        {(item) => (
          <Section key={item.name} items={item.children} title={item.name}>
            {(item) => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    )
  )
  .add(
    'with many sections',
    () => (
      <ComboBox items={lotsOfSections} label="Combobox" {...actions}>
        {(item) => (
          <Section key={item.name} items={item.children} title={item.name}>
            {(item: any) => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    )
  )
  .add(
    'user provided id and label',
    () => (
      <Flex direction="column" width="size-3000">
        <label id="test-label" htmlFor="test-id">Combobox</label>
        <ComboBox id="test-id" aria-labelledby="test-label" {...actions}>
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
      </Flex>
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
  .add(
    'isOpen',
    () => (
      <div>
        <div>Note: Combobox needs focus to show dropdown.</div>
        <ComboBox label="Combobox" isOpen {...actions}>
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
      </div>
    )
  )
  .add(
    'defaultOpen',
    () => (
      <div>
        <div>Note: Combobox needs focus to show dropdown.</div>
        <ComboBox label="Combobox" defaultOpen {...actions}>
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
      </div>
    )
  )
  .add(
    'inputValue (controlled)',
    () => (
      <ControlledValueComboBox inputValue="Test" />
    )
  )
  .add(
    'defaultInputValue (uncontrolled)',
    () => render({defaultInputValue: 'Item'})
  )
  .add(
    'selectedKey (controlled)',
    () => (
      <ControlledKeyComboBox selectedKey="4" />
    )
  )
  .add(
    'defaultSelectedKey (uncontrolled)',
    () => render({defaultSelectedKey: 'two'})
  )
  .add(
    'inputValue and selectedKey (controlled)',
    () => (
      <AllControlledComboBox selectedKey="2" inputValue="Kangaroo" />
    )
  )
  .add(
    'defaultInputValue and defaultSelectedKey (uncontrolled)',
    () => render({defaultInputValue: 'Item Two', defaultSelectedKey: 'two'})
  )
  .add(
    'inputValue and defaultSelectedKey (controlled by inputvalue)',
    () => (
      <ControlledValueComboBox inputValue="K" defaultSelectedKey="2" />
    )
  )
  .add(
    'defaultInputValue and selectedKey (controlled by selectedKey)',
    () => (
      <ControlledKeyComboBox defaultInputValue="Blah" selectedKey="2" />
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
    () => render({isReadOnly: true, defaultSelectedKey: 'two'})
  )
  .add(
    'labelPosition: top, labelAlign: end',
    () => render({labelAlign: 'end'})
  )
  .add(
    'labelPosition: side',
    () => render({labelPosition: 'side'})
  )
  .add(
    'no visible label',
    () => (
      <ComboBox items={items} aria-label="ComboBox" {...actions}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'no visible label, isQuiet',
    () => (
      <ComboBox items={items} aria-label="ComboBox" isQuiet {...actions}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
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
    'shouldSelectOnBlur: false',
    () => render({shouldSelectOnBlur: false})
  )
  .add(
    'allowsCustomValue: true',
    () => (
      <CustomValueComboBox allowsCustomValue selectedKey="2" />
    )
  )
  .add(
    'allowsCustomValue: true, shouldSelectOnBlur: false',
    () => (
      <CustomValueComboBox allowsCustomValue shouldSelectOnBlur={false} selectedKey="2" />
    )
  )
  .add(
    'customWidth',
    () => (
      <Flex direction="column">
        <ComboBox label="Combobox" {...actions} width="size-500">
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
        <ComboBox label="Combobox" {...actions} isQuiet width="size-3000">
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
        <ComboBox label="Combobox" {...actions} width="size-6000">
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
      </Flex>
    )
  )
  .add(
    'no visible label, customWidth',
    () => (
      <Flex gap="size-300" direction="column" >
        <ComboBox {...actions} aria-label="ComboBox" width="size-500">
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
        <ComboBox {...actions} aria-label="ComboBox" isQuiet width="size-3000">
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
        <ComboBox {...actions} aria-label="ComboBox" width="size-6000">
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
      </Flex>
    )
  )
  .add(
    'in small div',
    () => (
      <Flex width="size-500">
        <ComboBox aria-label="ComboBox" {...actions} >
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
      </Flex>
    )
  )
  .add(
    'onFilter, (value included in list)',
    () => (
      <CustomFilterComboBox selectedKey="2" />
    )
  );

let customFilterItems = [
  {name: 'The first item', id: '1'},
  {name: 'The second item', id: '2'},
  {name: 'The third item', id: '3'}
];

let CustomFilterComboBox = (props) => {
  let [list, setList] = React.useState(customFilterItems);
  let [selectedKey, setSelectedKey] = React.useState(props.selectedKey);

  let onSelectionChange = (key) => {
    setSelectedKey(key);
  };

  let onFilter = (value) => {
    setList(customFilterItems.filter(item => item.name.includes(value)));
  };

  return (
    <ComboBox items={list} selectedKey={selectedKey} label="Combobox" onSelectionChange={onSelectionChange} onFilter={onFilter} onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
      {(item: any) => <Item>{item.name}</Item>}
    </ComboBox>
  );
};

let AllControlledComboBox = (props) => {
  let [fieldState, setFieldState] = React.useState({selectedKey: props.selectedKey, inputValue: props.inputValue});

  let onSelectionChange = (key) => {
    setFieldState(prevState => ({inputValue: prevState.inputValue, selectedKey: key}));
  };

  let onInputChange = (value) => {
    setFieldState(prevState => ({inputValue: value, selectedKey: prevState.selectedKey}));
  };

  let setSnake = () => {
    setFieldState({inputValue: 'Snake', selectedKey: '3'});
  };

  let setRoss = () => {
    setFieldState({inputValue: 'Ross', selectedKey: '6'});
  };

  let clearAll = () => {
    setFieldState({inputValue: '', selectedKey: ''});
  };

  return (
    <div>
      <div>Current selectedKey: {fieldState.selectedKey}</div>
      <div>Current input value: {fieldState.inputValue}</div>
      <ButtonGroup marginEnd="30px">
        <Button variant="secondary" onPress={setSnake}>
          <Text>Snake</Text>
        </Button>
        <Button variant="secondary" onPress={setRoss}>
          <Text>Ross</Text>
        </Button>
        <Button variant="secondary" onPress={clearAll}>
          <Text>Clear key</Text>
        </Button>
      </ButtonGroup>
      <ComboBox {...props} selectedKey={fieldState.selectedKey} inputValue={fieldState.inputValue} items={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={onInputChange} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
};

let ControlledKeyComboBox = (props) => {
  let [selectedKey, setSelectedKey] = React.useState(props.selectedKey);

  let onSelectionChange = (key) => {
    setSelectedKey(key);
  };

  return (
    <div>
      <div>Current selectedKey: {selectedKey}</div>
      <ButtonGroup marginEnd="30px">
        <Button variant="secondary" onPress={() => setSelectedKey('3')}>
          <Text>Snake</Text>
        </Button>
        <Button variant="secondary" onPress={() => setSelectedKey('6')}>
          <Text>Ross</Text>
        </Button>
        <Button variant="secondary" onPress={() => setSelectedKey('')}>
          <Text>Clear key</Text>
        </Button>
      </ButtonGroup>
      <ComboBox {...props} selectedKey={selectedKey} items={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
};

let ControlledValueComboBox = (props) => {
  let [value, setValue] = React.useState(props.inputValue);

  let onValueChange = (value) => {
    setValue(value);
  };

  return (
    <div>
      <div>Current input value: {value}</div>
      <ButtonGroup marginEnd="30px">
        <Button variant="secondary" onPress={() => setValue('Blah')}>
          <Text>Blah</Text>
        </Button>
        <Button variant="secondary" onPress={() => setValue('Kangaroo')}>
          <Text>Kangaroo</Text>
        </Button>
        <Button variant="secondary" onPress={() => setValue('')}>
          <Text>Clear field</Text>
        </Button>
      </ButtonGroup>
      <ComboBox {...props} inputValue={value} items={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={onValueChange} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={action('onCustomValue')}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
};

let CustomValueComboBox = (props) => {
  let [selectedKey, setSelectedKey] = React.useState(props.selectedKey);
  let [customValue, setCustomValue] = React.useState();

  let onSelectionChange = (key) => {
    setSelectedKey(key);
  };

  let onCustomValue = (value) => {
    setCustomValue(value);
  };

  return (
    <div>
      <div>Last custom value: {customValue}</div>
      <div>Selected Key: {selectedKey}</div>
      <ComboBox {...props} selectedKey={selectedKey} items={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')} onCustomValue={onCustomValue} marginTop="40px">
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
      <Item key="one">Item One</Item>
      <Item key="two" textValue="Item Two">
        <Copy size="S" />
        <Text>Item Two</Text>
      </Item>
      <Item key="three">Item Three</Item>
    </ComboBox>
  );
}
