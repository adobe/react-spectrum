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
import {chain} from '@react-aria/utils';
import {CommandPalette, Item, Section} from '../';
import Copy from '@spectrum-icons/workflow/Copy';
import Draw from '@spectrum-icons/workflow/Draw';
import {Flex} from '@react-spectrum/layout';
import {Keyboard} from '@react-spectrum/text';
import {mergeProps} from '@react-aria/utils';
import React, {useRef, useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import {useAsyncList} from '@react-stately/data';
import {useFilter} from '@react-aria/i18n';
import {useListData, useTreeData} from '@react-stately/data';

let items = [
  {name: 'Aardvark', id: '1'},
  {name: 'Kangaroo', id: '2'},
  {name: 'Snake', id: '3'}
];

let withSection = [
  {name: 'Actions', id: 's1', children: [
    {name: 'Create Resource', id: '1'},
    {name: 'Copy Resource', id: '2'},
    {name: 'Delete Resource', id: '3'}
  ]},
  {name: 'Settings', id: 's2', children: [
    {name: 'User Settings', id: '4'},
    {name: 'Project Settings', id: '5'},
    {name: 'Appearance', id: '6'},
    {name: 'Extensions', id: '7'},
    {name: 'Profiles', id: '8'},
    {name: 'Security', id: '9'},
    {name: 'General', id: '10'},
    {name: 'Notifications', id: '11'},
    {name: 'Language', id: '12'},
    {name: 'Region', id: '13'},
    {name: 'Location', id: '14'}
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

storiesOf('CommandPalette', module)
  .add(
    'static items',
    () => render({})
  )
  .add(
    'dynamic items',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPalette defaultItems={items} label="Command Palette" {...actions}>
          {(item) => <Item>{item.name}</Item>}
        </CommandPalette>
      </>
    )
  )
  .add(
    'no items',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPalette defaultItems={[]} label="Command Palette" {...actions}>
          {(item: any) => <Item>{item.name}</Item>}
        </CommandPalette>
      </>
    )
  )
  .add(
    'with mapped items (defaultItem and items undef)',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPaletteWithMap defaultSelectedKey="two" />
      </>
    )
  )
  .add(
    'with sections',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPalette defaultItems={withSection} label="Command Palette" {...actions}>
          {(item) => (
            <Section key={item.name} items={item.children} title={item.name}>
              {(item) => <Item key={item.name}>{item.name}</Item>}
            </Section>
          )}
        </CommandPalette>
      </>
    )
  )
  .add(
    'with many sections',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPalette defaultItems={lotsOfSections} label="Command Palette" {...actions}>
          {(item) => (
            <Section key={item.name} items={item.children} title={item.name}>
              {(item: any) => <Item key={item.name}>{item.name}</Item>}
            </Section>
          )}
        </CommandPalette>
      </>
    )
  )
  .add(
    'complex items',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPalette label="Select action">
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
        </CommandPalette>
      </>
    )
  )
  .add(
    'disabled keys',
    () => (
      <>
        <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
        <CommandPalette defaultItems={withSection} label="Command Palette" disabledKeys={['Snake', 'Ross']} {...actions}>
          {(item) => (
            <Section key={item.name} items={item.children} title={item.name}>
              {(item) => <Item key={item.name}>{item.name}</Item>}
            </Section>
          )}
        </CommandPalette>
      </>
    )
  )
  .add(
    'inputValue (controlled)',
    () => (
      <ControlledValueCommandPalette inputValue="Snake" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultInputValue (uncontrolled)',
    () => render({defaultInputValue: 'Item Three', disabledKeys: ['two']})
  )
  .add(
    'selectedKey (controlled)',
    () => (
      <ControlledKeyCommandPalette selectedKey="4" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultSelectedKey (uncontrolled)',
    () => render({defaultSelectedKey: 'two', disabledKeys: ['one']})
  )
  .add(
    'inputValue and selectedKey (controlled)',
    () => (
      <AllControlledCommandPalette selectedKey="2" inputValue="Kangaroo" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'inputValue and defaultSelectedKey (controlled by inputvalue)',
    () => (
      <ControlledValueCommandPalette inputValue="K" defaultSelectedKey="2" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'defaultInputValue and selectedKey (controlled by selectedKey)',
    () => (
      <ControlledKeyCommandPalette defaultInputValue="Blah" selectedKey="2" disabledKeys={['2', '6']} />
    )
  )
  .add(
    'custom filter',
    () => (
      <CustomFilterCommandPalette />
    )
  )
  .add(
    'filtering with useListData',
    () => (
      <ListDataExample />
    )
  )
  .add(
    'server side filtering with useAsyncList',
    () => (
      <AsyncLoadingExample />
    )
  )
  .add(
    'server side filtering with useAsyncList (controlled key)',
    () => (
      <AsyncLoadingExampleControlledKey />
    )
  )
  .add(
    'server side filtering with controlled key and inputValue reset if not focused',
    () => (
      <AsyncLoadingExampleControlledKeyWithReset />
    )
  );

function ListDataExample() {
  let {contains} = useFilter({sensitivity: 'base'});
  let list = useListData({
    initialItems: items,
    initialFilterText: 'Snake',
    filter(item, text) {
      return contains(item.name, text);
    }
  });

  let [showAll, setShowAll] = useState(false);

  return (
    <Flex gap="size-300" direction="column" >
      Press <Keyboard>⌘K</Keyboard> to open Command Palette.
      <CommandPalette
        onOpenChange={(open, reason) => {
          if (reason === 'manual' && open) {
            setShowAll(true);
          }
        }}
        label="CommandPalette (show all on open)"
        items={showAll ? items : list.items}
        inputValue={list.filterText}
        onInputChange={(value) => {
          setShowAll(false);
          list.setFilterText(value);
        }}>
        {item => <Item>{item.name}</Item>}
      </CommandPalette>
    </Flex>
  );
}

function AsyncLoadingExample() {
  interface StarWarsChar {
    name: string,
    url: string
  }

  let list = useAsyncList<StarWarsChar>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, 1500));
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <>
      Press <Keyboard>⌘K</Keyboard> to open Command Palette.
      <CommandPalette
        label="Star Wars Character Lookup"
        items={list.items}
        inputValue={list.filterText}
        onInputChange={list.setFilterText}
        loadingState={list.loadingState}
        onLoadMore={chain(action('onLoadMore'), list.loadMore)}
        onOpenChange={action('onOpenChange')}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </CommandPalette>
    </>
  );
}

function AsyncLoadingExampleControlledKey() {
  interface StarWarsChar {
    name: string,
    url: string
  }

  let list = useAsyncList<StarWarsChar>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, 1500));

      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    },
    initialSelectedKeys: ['Luke Skywalker'],
    getKey: (item) => item.name
  });

  let onSelectionChange = (key) => {
    let itemText = list.getItem(key)?.name;
    list.setSelectedKeys(new Set([key]));
    list.setFilterText(itemText);
  };

  let onInputChange = (value) => {
    if (value === '') {
      list.setSelectedKeys(new Set([null]));
    }
    list.setFilterText(value);
  };

  let selectedKey = (list.selectedKeys as Set<React.Key>).values().next().value;
  return (
    <>
      Press <Keyboard>⌘K</Keyboard> to open Command Palette.
      <CommandPalette
        label="Star Wars Character Lookup"
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange}
        items={list.items}
        inputValue={list.filterText}
        onInputChange={onInputChange}
        loadingState={list.loadingState}
        onLoadMore={list.loadMore}
        onOpenChange={action('onOpenChange')}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </CommandPalette>
    </>
  );
}

function AsyncLoadingExampleControlledKeyWithReset() {
  interface StarWarsChar {
    name: string,
    url: string
  }
  let isFocused = useRef(false);
  let list = useAsyncList<StarWarsChar>({
    async load({signal, cursor, filterText, selectedKeys}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // Slow down load so progress circle can appear
      await new Promise(resolve => setTimeout(resolve, 1500));

      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      let selectedText;
      let selectedKey = (selectedKeys as Set<React.Key>).values().next().value;

      // If selectedKey exists and command palette is performing intial load, update the input value with the selected key text
      if (!isFocused.current && selectedKey) {
        let selectedItemName = json.results.find(item => item.name === selectedKey)?.name;
        if (selectedItemName != null && selectedItemName !== filterText) {
          selectedText = selectedItemName;
        }
      }
      return {
        items: json.results,
        cursor: json.next,
        filterText: selectedText ?? filterText
      };
    },
    initialSelectedKeys: ['Luke Skywalker'],
    getKey: (item) => item.name
  });

  let onSelectionChange = (key) => {
    let itemText = list.getItem(key)?.name;
    list.setSelectedKeys(new Set([key]));
    list.setFilterText(itemText);
  };

  let onInputChange = (value) => {
    if (value === '') {
      list.setSelectedKeys(new Set([null]));
    }
    list.setFilterText(value);
  };

  let selectedKey = (list.selectedKeys as Set<React.Key>).values().next().value;
  return (
    <>
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
      <CommandPalette
        onFocusChange={(focus) => isFocused.current = focus}
        label="Star Wars Character Lookup"
        selectedKey={selectedKey}
        onSelectionChange={onSelectionChange}
        items={list.items}
        inputValue={list.filterText}
        onInputChange={onInputChange}
        loadingState={list.loadingState}
        onLoadMore={list.loadMore}
        onOpenChange={action('onOpenChange')}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </CommandPalette>
    </>
  );
}

let customFilterItems = [
  {name: 'The first item', id: '1'},
  {name: 'The second item', id: '2'},
  {name: 'The third item', id: '3'}
];

let CustomFilterCommandPalette = (props) => {
  let {startsWith} = useFilter({sensitivity: 'base'});
  let [filterValue, setFilterValue] = React.useState('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let filteredItems = React.useMemo(() => customFilterItems.filter(item => startsWith(item.name, filterValue)), [props.items, filterValue, startsWith]);

  return (
    <>
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
      <CommandPalette
        {...mergeProps(props, actions)}
        label="Command Palette"
        items={filteredItems}
        inputValue={filterValue}
        onInputChange={setFilterValue}>
        {(item: any) => <Item>{item.name}</Item>}
      </CommandPalette>
    </>
  );
};

function AllControlledCommandPalette(props) {
  let [fieldState, setFieldState] = React.useState({
    selectedKey: props.selectedKey,
    inputValue: props.inputValue
  });

  let list = useTreeData({
    initialItems: withSection
  });

  let onSelectionChange = (key: React.Key) => {
    setFieldState(prevState => ({
      inputValue: list.getItem(key)?.value.name ?? prevState.inputValue,
      selectedKey: key
    }));
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
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
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
      <CommandPalette disabledKeys={props.disabledKeys} selectedKey={fieldState.selectedKey} inputValue={fieldState.inputValue} defaultItems={list.items} label="Command Palette" onOpenChange={action('onOpenChange')} onInputChange={onInputChange} onSelectionChange={onSelectionChange} onBlur={action('onBlur')} onFocus={action('onFocus')}>
        {item => (
          <Section items={item.children} title={item.value.name}>
            {item => <Item>{item.value.name}</Item>}
          </Section>
        )}
      </CommandPalette>
    </div>
  );
}

let ControlledKeyCommandPalette = (props) => {
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
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
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
      <CommandPalette {...mergeProps(props, actions)} selectedKey={selectedKey} defaultItems={withSection} label="Command Palette" onSelectionChange={onSelectionChange}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </CommandPalette>
    </div>
  );
};

let ControlledValueCommandPalette = (props) => {
  let [value, setValue] = React.useState(props.inputValue);

  let onValueChange = (value) => {
    setValue(value);
  };

  return (
    <div>
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
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
      <CommandPalette {...mergeProps(props, actions)} inputValue={value} defaultItems={withSection} label="Command Palette" onInputChange={onValueChange}>
        {(item: any) => (
          <Section items={item.children} title={item.name}>
            {(item: any) => <Item>{item.name}</Item>}
          </Section>
        )}
      </CommandPalette>
    </div>
  );
};

function render(props = {}) {
  return (
    <>
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
      <CommandPalette label="Command Palette" {...mergeProps(props, actions)}>
        <Item key="one">New Resource</Item>
        <Item key="two" textValue="Item Two">
          <Copy size="S" />
          <Text>Copy Resource</Text>
        </Item>
        <Item key="three">Open Resource with...</Item>
      </CommandPalette>
    </>
  );
}

function CommandPaletteWithMap(props) {
  let [items, setItems] = React.useState([
    {name: 'The first item', id: 'one'},
    {name: 'The second item', id: 'two'},
    {name: 'The third item', id: 'three'}
  ]);

  let onClick = () => {
    setItems([
      {name: 'The first item new text', id: 'one'},
      {name: 'The second item new text', id: 'two'},
      {name: 'The third item new text', id: 'three'}
    ]);
  };

  return (
    <>
      <div>Press <Keyboard>⌘K</Keyboard> to open Command Palette.</div>
      <button onClick={onClick}>Press to change items</button>
      <CommandPalette label="Command Palette" {...mergeProps(props, actions)}>
        {items.map((item) => (
          <Item key={item.id}>
            {item.name}
          </Item>
        ))}
      </CommandPalette>
    </>
  );
}
