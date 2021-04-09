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
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import Blower from '@spectrum-icons/workflow/Blower';
import Book from '@spectrum-icons/workflow/Book';
import {Button, Flex} from '@adobe/react-spectrum';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, ListBox, Section} from '../';
import {Label} from '@react-spectrum/label';
import Paste from '@spectrum-icons/workflow/Paste';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/text';
import {useAsyncList} from '@react-stately/data';

let iconMap = {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blower,
  Book,
  Copy,
  Cut,
  Paste
};

let hardModeProgrammatic = [
  {name: 'Section 1', children: [
    {name: 'Copy', icon: 'Copy'},
    {name: 'Cut', icon: 'Cut'},
    {name: 'Paste', icon: 'Paste'}
  ]},
  {name: 'Section 2', children: [
    {name: 'Puppy', icon: 'AlignLeft'},
    {name: 'Doggo', icon: 'AlignCenter'},
    {name: 'Floof', icon: 'AlignRight'}
  ]}
];

let flatOptions = [
  {name: 'Aardvark'},
  {name: 'Kangaroo'},
  {name: 'Snake'},
  {name: 'Danni'},
  {name: 'Devon'},
  {name: 'Ross'},
  {name: 'Puppy'},
  {name: 'Doggo'},
  {name: 'Floof'}
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
    {name: 'Ross'}
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

storiesOf('ListBox', module)
  .addDecorator(story => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Label id="label">Choose an item</Label>
      <div style={{display: 'flex', minWidth: '200px', background: 'var(--spectrum-global-color-gray-50)', border: '1px solid lightgray', maxHeight: 300}}>
        {story()}
      </div>
    </div>
  ))
  .add(
    'Default ListBox',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={flatOptions}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </ListBox>
    )
  )
  .add(
    'ListBox w/ sections',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox w/ many sections and selection',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" items={lotsOfSections} onSelectionChange={action('onSelectionChange')}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {(item: any) => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox w/ sections and no title',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection}>
        {item => (
          <Section key={item.name} items={item.children} aria-label={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'Static',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
      </ListBox>
    )
  )
  .add(
    'Static with sections and selection',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple">
        <Section title="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section title="Section 2">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'Static with sections and no title',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label">
        <Section aria-label="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section aria-label="Section 2">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with default selected option',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')} items={withSection} defaultSelectedKeys={['Kangaroo']}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'single selection with default selected option',
    () => (
      <ListBox flexGrow={1} selectionMode="single" onSelectionChange={action('onSelectionChange')} aria-labelledby="label" items={flatOptions} defaultSelectedKeys={['Kangaroo']}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </ListBox>
    )
  )
  .add(
    'static with default selected options',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')} defaultSelectedKeys={['2', '3']}>
        <Section title="Section 1">
          <Item key="1">
            One
          </Item>
          <Item key="2">
            Two
          </Item>
          <Item key="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item key="4">
            Four
          </Item>
          <Item key="5">
            Five
          </Item>
          <Item key="6">
            Six
          </Item>
          <Item key="7">
            Seven
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with selected options (controlled)',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')} items={withSection} selectedKeys={['Kangaroo']}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'static with selected options (controlled)',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')} selectedKeys={['2']}>
        <Section title="Section 1">
          <Item key="1">
            One
          </Item>
          <Item key="2">
            Two
          </Item>
          <Item key="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item key="4">
            Four
          </Item>
          <Item key="5">
            Five
          </Item>
          <Item key="6">
            Six
          </Item>
          <Item key="7">
            Seven
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with disabled options',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} disabledKeys={['Kangaroo', 'Ross']}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'static with disabled options',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" disabledKeys={['3', '5']}>
        <Section title="Section 1">
          <Item key="1">
            One
          </Item>
          <Item key="2">
            Two
          </Item>
          <Item key="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item key="4">
            Four
          </Item>
          <Item key="5">
            Five
          </Item>
          <Item key="6">
            Six
          </Item>
          <Item key="7">
            Seven
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'Multiple selection',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} onSelectionChange={action('onSelectionChange')} selectionMode="multiple" defaultSelectedKeys={['Aardvark', 'Snake']} disabledKeys={['Kangaroo', 'Ross']}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'Multiple selection, static',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" onSelectionChange={action('onSelectionChange')} selectionMode="multiple" defaultSelectedKeys={['2', '5']} disabledKeys={['1', '3']}>
        <Section title="Section 1">
          <Item key="1">
            One
          </Item>
          <Item key="2">
            Two
          </Item>
          <Item key="3">
            Three
          </Item>
        </Section>
        <Section title="Section 2">
          <Item key="4">
            Four
          </Item>
          <Item key="5">
            Five
          </Item>
          <Item key="6">
            Six
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'No selection allowed',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection}>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'No selection allowed, static',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label">
        <Section title="Section 1">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </Section>
        <Section title="Section 2">
          <Item>Four</Item>
          <Item>Five</Item>
          <Item>Six</Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus=true',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} autoFocus>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus=true, selectionMode=single, default selected key (uncontrolled)',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} autoFocus defaultSelectedKeys={['Snake']} selectionMode="single">
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus="first"',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} autoFocus="first">
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with autoFocus="last"',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} autoFocus="last">
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'ListBox with keyboard selection wrapping',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={withSection} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} shouldFocusWrap>
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => <Item key={item.name}>{item.name}</Item>}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'with semantic elements (static)',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')}>
        <Section title="Section 1">
          <Item textValue="Copy">
            <Copy size="S" />
            <Text>Copy</Text>
          </Item>
          <Item textValue="Cut">
            <Cut size="S" />
            <Text>Cut</Text>
          </Item>
          <Item textValue="Paste">
            <Paste size="S" />
            <Text>Paste</Text>
          </Item>
        </Section>
        <Section title="Section 2">
          <Item textValue="Puppy">
            <AlignLeft size="S" />
            <Text>Puppy</Text>
            <Text slot="description">Puppy description super long as well geez</Text>
          </Item>
          <Item textValue="Doggo with really really really long long long text">
            <AlignCenter size="S" />
            <Text>Doggo with really really really long long long text</Text>
          </Item>
          <Item textValue="Floof">
            <AlignRight size="S" />
            <Text>Floof</Text>
          </Item>
          <Item>
            Basic Item
          </Item>
        </Section>
      </ListBox>
    )
  )
  .add(
    'with semantic elements (generative), multiple selection',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={hardModeProgrammatic} onSelectionChange={action('onSelectionChange')} selectionMode="multiple">
        {item => (
          <Section key={item.name} items={item.children} title={item.name}>
            {item => customOption(item)}
          </Section>
        )}
      </ListBox>
    )
  )
  .add(
    'isLoading',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={[]} isLoading>
        {item => <Item>{item.name}</Item>}
      </ListBox>
    )
  )
  .add(
    'isLoading more',
    () => (
      <ListBox flexGrow={1} aria-labelledby="label" items={flatOptions} isLoading>
        {item => <Item key={item.name}>{item.name}</Item>}
      </ListBox>
    )
  )
  .add(
    'async loading',
    () => (
      <AsyncLoadingExample />
    )
  );

storiesOf('ListBox', module)
  .addDecorator(story => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Label id="label">Choose an item</Label>
      <div style={{display: 'flex', minWidth: '200px', background: 'var(--spectrum-global-color-gray-50)', border: '1px solid lightgray'}}>
        {story()}
      </div>
    </div>
  ))
  .add(
    'async loading, resizable',
    () => (
      // need display flex or set a height on the listbox so it doesn't keep getting more elements
      <div style={{display: 'flex', height: '200px', flexGrow: 1, minWidth: '200px', padding: '10px', resize: 'both', overflow: 'auto'}}>
        <AsyncLoadingExample />
      </div>
    )
  );

storiesOf('ListBox', module)
  .add(
    'listbox containers',
    () => (
      <App />
    )
  );

let customOption = (item) => {
  let Icon = iconMap[item.icon];
  return (
    <Item textValue={item.name} key={item.name}>
      {item.icon && <Icon size="S" />}
      <Text>{item.name}</Text>
    </Item>
  );
};

function AsyncLoadingExample() {
  interface Pokemon {
    name: string,
    url: string
  }

  let list = useAsyncList<Pokemon>({
    async load({signal, cursor}) {
      let res = await fetch(cursor || 'https://pokeapi.co/api/v2/pokemon', {signal});
      let json = await res.json();
      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <ListBox flexGrow={1} aria-labelledby="label" items={list.items} isLoading={list.isLoading} onLoadMore={list.loadMore}>
      {item => <Item key={item.name}>{item.name}</Item>}
    </ListBox>
  );
}

let itemsForDemo = Array.from(new Array(100)).map((val, index) => ({val, index}));
function App() {
  let [size, setSize] = useState('700px');

  const toggleSize = () => {
    if (size === '700px') {
      setSize('300px');
    } else {
      setSize('700px');
    }
  };

  return (
    <>
      <Button variant="primary" onPress={toggleSize}> Toggle Size</Button>
      <div style={{display: 'flex', height: size, overflow: 'hidden'}}>
        <Flex maxHeight="300px">
          <Text>Max-Height: 300px</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
        <Flex>
          <Text>None</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
        <Flex maxHeight="700px">
          <Text>Max-Height: 700px</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
        <Flex maxHeight="100%">
          <Text>MaxHeight: 100%</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
        <Flex maxHeight="50%">
          <Text>MaxHeight: 50%</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
        <Flex height="700px">
          <Text>Height: 700px</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
        <Flex height="100%">
          <Text>Height: 100%</Text>
          <ListBox width="150px" items={itemsForDemo}>
            { item => (
              <Item textValue={String(item.index)} key={item.index}>
                <Text>IDX: {item.index}</Text>
              </Item>
            )}
          </ListBox>
        </Flex>
      </div>
    </>
  );
}
