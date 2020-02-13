import {Item, Section, Tree} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

interface ItemType {
  name: string,
  children?: ItemType[]
}

let items: ItemType[] = [
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

let longList: ItemType[] = [];
for (let i = 0; i < 1000; i++) {
  longList.push({name: 'Item ' + i});
}

storiesOf('Tree', module)
  .add(
    'Default',
    () => (
      <Tree items={items} itemKey="name" onSelectionChange={keys => console.log(keys)}>
        {item => <Item childItems={item.children}>{item.name}</Item>}
      </Tree>
    )
  )
  .add(
    'Sections',
    () => (
      <Tree items={items} itemKey="name">
        {item => (
          <Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>
        )}
      </Tree>
    )
  )
  .add(
    'Static',
    () => (
      <Tree>
        <Item>One</Item>
        <Item>Two</Item>
        <Item title="Three">
          <Item>Four</Item>
          <Item title="Five">
            <Item>Six</Item>
          </Item>
        </Item>
      </Tree>
    )
  )
  .add(
    'Static sections',
    () => (
      <Tree>
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
      </Tree>
    )
  )
  .add(
    'Long list',
    () => (
      <div>
        <input />
        <Tree items={longList} itemKey="name">
          {item => <Item>{item.name}</Item>}
        </Tree>
        <input />
      </div>
    )
  );
