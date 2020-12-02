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
import Add from '@spectrum-icons/workflow/Add';
import Alert from '@spectrum-icons/workflow/Alert';
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {ComboBox, Item, Section} from '../';
import Copy from '@spectrum-icons/workflow/Copy';
import Draw from '@spectrum-icons/workflow/Draw';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import {TextField} from '@react-spectrum/textfield';
import {useAsyncList} from '@react-stately/data';
import {useFilter} from '@react-aria/i18n';
import {useListData, useTreeData} from '@react-stately/data';

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
  onFocus: action('onFocus')
};

storiesOf('ComboBox', module)
  .add(
    'static items',
    () => render({})
  )
  .add(
    'dynamic items',
    () => (
      <ComboBox defaultItems={items} label="Combobox" {...actions}>
        {(item) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'no items',
    () => (
      <ComboBox defaultItems={[]} label="Combobox" {...actions}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'with sections',
    () => (
      <ComboBox defaultItems={withSection} label="Combobox" {...actions}>
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
      <ComboBox defaultItems={lotsOfSections} label="Combobox" {...actions}>
        {(item) => (
          <Section key={item.name} items={item.children} title={item.name}>
            {(item: any) => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    )
  )
  .add(
    'complex items',
    () => (
      <ComboBox label="Select action">
        <Item textValue="Add to queue">
          <Add />
          <Text>Add to queue</Text>
          <Text slot="description">Add to current watch queue.</Text>
        </Item>
        <Item textValue="Add review">
          <Draw />
          <Text>Add review</Text>
          <Text slot="description">Post a review for the episode.</Text>
        </Item>
        <Item textValue="Subscribe to series">
          <Bell />
          <Text>Subscribe to series</Text>
          <Text slot="description">
            Add series to your subscription list and be notified when a new episode
            airs.
          </Text>
        </Item>
        <Item textValue="Report">
          <Alert />
          <Text>Report</Text>
          <Text slot="description">Report an issue/violation.</Text>
        </Item>
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
    () => (
      <Flex direction="column">
        <TextField label="Email" />
        <ComboBox label="Combobox" menuTrigger="manual" {...actions}>
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
        <TextField label="Name" />
      </Flex>
    )
  )
  .add(
    'isOpen',
    () => <ControlledOpenCombobox isOpen />,
    {note: 'Combobox needs focus to show dropdown.'}
  )
  .add(
    'defaultOpen',
    () => (
      <Flex direction="column">
        <TextField label="Email" />
        <ComboBox label="Combobox" defaultOpen {...actions}>
          <Item key="one">Item One</Item>
          <Item key="two" textValue="Item Two">
            <Copy size="S" />
            <Text>Item Two</Text>
          </Item>
          <Item key="three">Item Three</Item>
        </ComboBox>
        <TextField label="Name" />
      </Flex>
    ),
    {note: 'Combobox needs focus to show dropdown.'}
  )
  .add(
    'disabled keys',
    () => (
      <ComboBox defaultItems={withSection} label="Combobox" disabledKeys={['Snake', 'Ross']} {...actions}>
        {(item) => (
          <Section key={item.name} items={item.children} title={item.name}>
            {(item) => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
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
      <ComboBox defaultItems={items} aria-label="ComboBox" {...actions}>
        {(item: any) => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'no visible label, isQuiet',
    () => (
      <ComboBox defaultItems={items} aria-label="ComboBox" isQuiet {...actions}>
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
    'validationState: invalid, isQuiet',
    () => render({validationState: 'invalid', isQuiet: true, defaultSelectedKey: 'two'})
  )
  .add(
    'validationState: valid, isQuiet',
    () => render({validationState: 'valid', isQuiet: true, defaultSelectedKey: 'two'})
  )
  .add(
    'placeholder',
    () => render({placeholder: 'Select an item...'})
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
    () => (
      <CustomValueComboBox allowsCustomValue selectedKey="2" disabledKeys={['3', '6']} />
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
    'inputValue (controlled)',
    () => (
      <ControlledValueComboBox inputValue="Snake" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultInputValue (uncontrolled)',
    () => render({defaultInputValue: 'Item Three', disabledKeys: ['two']})
  )
  .add(
    'selectedKey (controlled)',
    () => (
      <ControlledKeyComboBox selectedKey="4" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultSelectedKey (uncontrolled)',
    () => render({defaultSelectedKey: 'two', disabledKeys: ['one']})
  )
  .add(
    'inputValue and selectedKey (controlled)',
    () => (
      <AllControlledComboBox selectedKey="2" inputValue="Kangaroo" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultInputValue and defaultSelectedKey (uncontrolled)',
    () => render({defaultInputValue: 'Item Two', defaultSelectedKey: 'two', disabledKeys: ['two']})
  )
  .add(
    'inputValue and defaultSelectedKey (controlled by inputvalue)',
    () => (
      <ControlledValueComboBox inputValue="K" defaultSelectedKey="2" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultInputValue and selectedKey (controlled by selectedKey)',
    () => (
      <ControlledKeyComboBox defaultInputValue="Blah" selectedKey="2" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'inputValue, selectedKey, and isOpen (controlled)',
    () => (
      <AllControlledOpenComboBox selectedKey="2" inputValue="Kangaroo" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'custom filter',
    () => (
      <CustomFilterComboBox />
    )
    )
  .add(
    'isLoading',
    () => (
      <ComboBox label="Combobox" isLoading defaultItems={[]}>
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'isLoading, validationState: invalid',
    () => (
      <ComboBox label="Combobox" isLoading validationState="invalid" defaultItems={[]}>
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'isLoading, isQuiet',
    () => (
      <ComboBox label="Combobox" isLoading isQuiet defaultItems={[]}>
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'isLoading, isQuiet, validationState: invalid',
    () => (
      <ComboBox label="Combobox" isLoading isQuiet validationState="invalid" defaultItems={[]}>
        {item => <Item>{item.name}</Item>}
      </ComboBox>
    )
  )
  .add(
    'filtering with useListData',
    () => (
      <ListDataExample />
    )
  )
  .add(
    'async loading',
    () => (
      <AsyncLoadingExample />
    )
  );

function ListDataExample() {
  let {contains} = useFilter({sensitivity: 'base'});
  let list = useListData({
    initialItems: items,
    filterFn(item, text) {
      return contains(item.name, text);
    }
  });

  return (
    <ComboBox
      label="ComboBox"
      items={list.items}
      inputValue={list.filterText}
      onInputChange={list.setFilter}>
      {item => <Item>{item.name}</Item>}
    </ComboBox>
  )
}

function AsyncLoadingExample() {
  interface Pokemon {
    name: string,
    url: string
  }

  let {startsWith} = useFilter({sensitivity: 'base'});
  // let [filterValue, setFilterValue] = React.useState('');

  let list = useAsyncList<Pokemon>({
    async load({signal, cursor, filterText}) {
      console.log('filterText', filterText);
      let res = await fetch(cursor || 'https://pokeapi.co/api/v2/pokemon', {signal});
      let json = await res.json();
      console.log('json', json.results.length);
      // The API is too fast sometimes, so make it take longer so we can see the spinner
      await new Promise(resolve => setTimeout(resolve, cursor ? 500 : 1000));

      let filteredOptions = json.results.filter(option => {
        return startsWith(option.name, filterText)
      });

      return {
        items: filteredOptions,
        cursor: json.next
      };
    },
    initialFilterText: 'B'
  });

  let onInputChange = (text) => {
    list.setFilter(text);
    // list.reload();
  }

  return (
    <ComboBox
      label="Pick a Pokemon"
      items={list.items}
      inputValue={list.filterText}
      onInputChange={onInputChange}
      isLoading={list.isLoading}
      onLoadMore={list.loadMore}>
      {item => <Item key={item.name}>{item.name}</Item>}
    </ComboBox>
  );
}

let customFilterItems = [
  {name: 'The first item', id: '1'},
  {name: 'The second item', id: '2'},
  {name: 'The third item', id: '3'}
];

let CustomFilterComboBox = (props) => {
  let {startsWith} = useFilter({sensitivity: 'base'});
  let [filterValue, setFilterValue] = React.useState('');
  let filteredItems = React.useMemo(() => customFilterItems.filter(item => startsWith(item.name, filterValue)), [props.items, filterValue]);

  return (
    <ComboBox
      {...actions}
      {...props}
      label="Combobox"
      items={filteredItems}
      inputValue={filterValue}
      onInputChange={setFilterValue}>
      {(item: any) => <Item>{item.name}</Item>}
    </ComboBox>
  );
};

function AllControlledComboBox(props) {
  let [fieldState, setFieldState] = React.useState({
    selectedKey: props.selectedKey,
    inputValue: props.inputValue
  });

  let list = useTreeData({
    initialItems: withSection
  });

  let onSelectionChange = (key: React.Key) => {
    setFieldState({
      inputValue: list.getItem(key)?.value.name ?? '',
      selectedKey: key
    });
  };

  let onInputChange = (value: string) => {
    setFieldState(prevState => ({
      inputValue: value,
      selectedKey: value === '' ? null : prevState.selectedKey
    }));
  };

  let setSnake = () => {
    setFieldState({inputValue: 'Snake', selectedKey: '3'});
  };

  let setRoss = () => {
    setFieldState({inputValue: 'Ross', selectedKey: '6'});
  };

  let clearAll = () => {
    setFieldState({inputValue: '', selectedKey: null});
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
      <ComboBox disabledKeys={props.disabledKeys} selectedKey={fieldState.selectedKey} inputValue={fieldState.inputValue} defaultItems={list.items} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={onInputChange} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')}>
        {item => (
          <Section items={item.children} title={item.value.name}>
            {item => <Item>{item.value.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
}

let ControlledKeyComboBox = (props) => {
  let [selectedKey, setSelectedKey] = React.useState(props.selectedKey);

  let onSelectionChange = (key) => {
    setSelectedKey(key);
  };

  let setSnake = () => {
    setSelectedKey('3');
  };

  let setRoss = () => {
    setSelectedKey('6');
  };

  return (
    <div>
      <div>Current selectedKey: {selectedKey}</div>
      <ButtonGroup marginEnd="30px">
        <Button variant="secondary" onPress={setSnake}>
          <Text>Snake</Text>
        </Button>
        <Button variant="secondary" onPress={setRoss}>
          <Text>Ross</Text>
        </Button>
        <Button variant="secondary" onPress={() => setSelectedKey(null)}>
          <Text>Clear key</Text>
        </Button>
      </ButtonGroup>
      <ComboBox {...props} selectedKey={selectedKey} defaultItems={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')}>
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
      <ButtonGroup marginEnd="30px" UNSAFE_style={{verticalAlign: 'bottom'}}>
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
      <ComboBox {...props} inputValue={value} defaultItems={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={onValueChange} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')}>
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

  let onSelectionChange = (key) => {
    setSelectedKey(key);
  };

  return (
    <div>
      <div>Selected Key: {selectedKey}</div>
      <ComboBox {...props} selectedKey={selectedKey} defaultItems={withSection} label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')} marginTop={20}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
};

let ControlledOpenCombobox = (props) => {
  let [isOpen, setOpen] = React.useState(props.isOpen);

  return (
    <Flex direction="column">
      <TextField label="Email" />
      <ComboBox label="Combobox" isOpen={isOpen} {...actions} onOpenChange={setOpen}>
        <Item key="one">Item One</Item>
        <Item key="two" textValue="Item Two">
          <Copy size="S" />
          <Text>Item Two</Text>
        </Item>
        <Item key="three">Item Three</Item>
      </ComboBox>
      <TextField label="Name" />
    </Flex>
  );
};

function AllControlledOpenComboBox(props) {
  let [fieldState, setFieldState] = React.useState({
    isOpen: false,
    selectedKey: props.selectedKey,
    inputValue: props.inputValue
  });

  let list = useTreeData({
    initialItems: withSection
  });

  let onSelectionChange = (key: React.Key) => {
    setFieldState({
      isOpen: false,
      inputValue: list.getItem(key)?.value.name ?? '',
      selectedKey: key
    });
  };

  let onInputChange = (value: string) => {
    setFieldState(prevState => ({
      isOpen: true,
      inputValue: value,
      selectedKey: value === '' ? null : prevState.selectedKey
    }));
  };

  let onOpenChange = (isOpen: boolean) => {
    setFieldState(prevState => ({
      isOpen,
      inputValue: prevState.inputValue,
      selectedKey: prevState.selectedKey
    }));
  };

  return (
    <div>
      <ComboBox disabledKeys={props.disabledKeys} selectedKey={fieldState.selectedKey} inputValue={fieldState.inputValue} defaultItems={list.items} label="Combobox" isOpen={fieldState.isOpen} onOpenChange={onOpenChange} onInputChange={onInputChange} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')}>
        {item => (
          <Section items={item.children} title={item.value.name}>
            {item => <Item>{item.value.name}</Item>}
          </Section>
        )}
      </ComboBox>
    </div>
  );
}

function render(props = {}) {
  return (
    <ComboBox label="Combobox" onOpenChange={action('onOpenChange')} onInputChange={action('onInputChange')} onSelectionChange={action('onSelectionChange')} onBlur={action('onBlur')} onFocus={action('onFocus')} {...props}>
      <Item key="one">Item One</Item>
      <Item key="two" textValue="Item Two">
        <Copy size="S" />
        <Text>Item Two</Text>
      </Item>
      <Item key="three">Item Three</Item>
    </ComboBox>
  );
}
