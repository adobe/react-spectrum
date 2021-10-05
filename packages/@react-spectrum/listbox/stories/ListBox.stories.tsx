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

export default {
  title: 'ListBox',

  decorators: [story => (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Label id="label">Choose an item</Label>
      <div style={{display: 'flex', minWidth: '200px', background: 'var(--spectrum-global-color-gray-50)', border: '1px solid lightgray', maxHeight: 300}}>
        {story()}
      </div>
    </div>
    )]
};

export const DefaultListBox = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={flatOptions}>
    {item => <Item key={item.name}>{item.name}</Item>}
  </ListBox>
);

DefaultListBox.story = {
  name: 'Default ListBox'
};

export const ListBoxWSections = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWSections.story = {
  name: 'ListBox w/ sections'
};

export const ListBoxWManySectionsAndSelection = () => (
  <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" items={lotsOfSections} onSelectionChange={action('onSelectionChange')}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {(item: any) => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWManySectionsAndSelection.story = {
  name: 'ListBox w/ many sections and selection'
};

export const ListBoxWSectionsAndNoTitle = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection}>
    {item => (
      <Section key={item.name} items={item.children} aria-label={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWSectionsAndNoTitle.story = {
  name: 'ListBox w/ sections and no title'
};

export const Static = () => (
  <ListBox flexGrow={1} aria-labelledby="label">
    <Item>One</Item>
    <Item>Two</Item>
    <Item>Three</Item>
  </ListBox>
);

export const StaticWithSectionsAndSelection = () => (
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
);

StaticWithSectionsAndSelection.story = {
  name: 'Static with sections and selection'
};

export const StaticWithSectionsAndNoTitle = () => (
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
);

StaticWithSectionsAndNoTitle.story = {
  name: 'Static with sections and no title'
};

export const WithDefaultSelectedOption = () => (
  <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')} items={withSection} defaultSelectedKeys={['Kangaroo']}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

WithDefaultSelectedOption.story = {
  name: 'with default selected option'
};

export const SingleSelectionWithDefaultSelectedOption = () => (
  <ListBox flexGrow={1} selectionMode="single" onSelectionChange={action('onSelectionChange')} aria-labelledby="label" items={flatOptions} defaultSelectedKeys={['Kangaroo']}>
    {item => <Item key={item.name}>{item.name}</Item>}
  </ListBox>
);

SingleSelectionWithDefaultSelectedOption.story = {
  name: 'single selection with default selected option'
};

export const StaticWithDefaultSelectedOptions = () => (
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
);

StaticWithDefaultSelectedOptions.story = {
  name: 'static with default selected options'
};

export const WithSelectedOptionsControlled = () => (
  <ListBox flexGrow={1} aria-labelledby="label" selectionMode="multiple" onSelectionChange={action('onSelectionChange')} items={withSection} selectedKeys={['Kangaroo']}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

WithSelectedOptionsControlled.story = {
  name: 'with selected options (controlled)'
};

export const StaticWithSelectedOptionsControlled = () => (
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
);

StaticWithSelectedOptionsControlled.story = {
  name: 'static with selected options (controlled)'
};

export const WithDisabledOptions = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} disabledKeys={['Kangaroo', 'Ross']}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

WithDisabledOptions.story = {
  name: 'with disabled options'
};

export const StaticWithDisabledOptions = () => (
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
);

StaticWithDisabledOptions.story = {
  name: 'static with disabled options'
};

export const MultipleSelection = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} onSelectionChange={action('onSelectionChange')} selectionMode="multiple" defaultSelectedKeys={['Aardvark', 'Snake']} disabledKeys={['Kangaroo', 'Ross']}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

MultipleSelection.story = {
  name: 'Multiple selection'
};

export const MultipleSelectionStatic = () => (
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
);

MultipleSelectionStatic.story = {
  name: 'Multiple selection, static'
};

export const NoSelectionAllowed = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection}>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

NoSelectionAllowed.story = {
  name: 'No selection allowed'
};

export const NoSelectionAllowedStatic = () => (
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
);

NoSelectionAllowedStatic.story = {
  name: 'No selection allowed, static'
};

export const ListBoxWithAutoFocusTrue = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} autoFocus>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWithAutoFocusTrue.story = {
  name: 'ListBox with autoFocus=true'
};

export const ListBoxWithAutoFocusTrueSelectionModeSingleDefaultSelectedKeyUncontrolled = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} autoFocus defaultSelectedKeys={['Snake']} selectionMode="single">
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWithAutoFocusTrueSelectionModeSingleDefaultSelectedKeyUncontrolled.story = {
  name: 'ListBox with autoFocus=true, selectionMode=single, default selected key (uncontrolled)'
};

export const ListBoxWithAutoFocusFirst = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} autoFocus="first">
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWithAutoFocusFirst.story = {
  name: 'ListBox with autoFocus="first"'
};

export const ListBoxWithAutoFocusLast = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} autoFocus="last">
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWithAutoFocusLast.story = {
  name: 'ListBox with autoFocus="last"'
};

export const ListBoxWithKeyboardSelectionWrapping = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={withSection} selectionMode="multiple" onSelectionChange={action('onSelectionChange')} shouldFocusWrap>
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => <Item key={item.name}>{item.name}</Item>}
      </Section>
    )}
  </ListBox>
);

ListBoxWithKeyboardSelectionWrapping.story = {
  name: 'ListBox with keyboard selection wrapping'
};

export const WithSemanticElementsStatic = () => (
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
);

WithSemanticElementsStatic.story = {
  name: 'with semantic elements (static)'
};

export const WithSemanticElementsGenerativeMultipleSelection = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={hardModeProgrammatic} onSelectionChange={action('onSelectionChange')} selectionMode="multiple">
    {item => (
      <Section key={item.name} items={item.children} title={item.name}>
        {item => customOption(item)}
      </Section>
    )}
  </ListBox>
);

WithSemanticElementsGenerativeMultipleSelection.story = {
  name: 'with semantic elements (generative), multiple selection'
};

export const IsLoading = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={[]} isLoading>
    {item => <Item>{item.name}</Item>}
  </ListBox>
);

IsLoading.story = {
  name: 'isLoading'
};

export const IsLoadingMore = () => (
  <ListBox flexGrow={1} aria-labelledby="label" items={flatOptions} isLoading>
    {item => <Item key={item.name}>{item.name}</Item>}
  </ListBox>
);

IsLoadingMore.story = {
  name: 'isLoading more'
};

export const AsyncLoading = () => (
  <AsyncLoadingExample />
);

AsyncLoading.story = {
  name: 'async loading'
};

export const AsyncLoadingResizable = () => (
  // need display flex or set a height on the listbox so it doesn't keep getting more elements
  <div style={{display: 'flex', height: '200px', flexGrow: 1, minWidth: '200px', padding: '10px', resize: 'both', overflow: 'auto'}}>
    <AsyncLoadingExample />
  </div>
);

AsyncLoadingResizable.decorators = [story => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <Label id="label">Choose an item</Label>
    <div style={{display: 'flex', minWidth: '200px', background: 'var(--spectrum-global-color-gray-50)', border: '1px solid lightgray'}}>
      {story()}
    </div>
  </div>
  )];

AsyncLoadingResizable.story = {
  name: 'async loading, resizable'
};

export const ListboxContainers = () => (
  <App />
);

ListboxContainers.story = {
  name: 'listbox containers'
};

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
