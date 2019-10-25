import {Item, Section, TreeView} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

// let items = [];
// for (let i = 0; i < 1000; i++) {
//   items.push({name: 'Item ' + i});
// }

let items = [
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

storiesOf('TreeView', module)
  .add(
    'Default',
    () => (
      <TreeView items={items} itemKey="name">
        {item => <Item childItems={item.children}>{item.name}</Item>}
      </TreeView>
    )
  )
  .add(
    'Sections',
    () => (
      <TreeView items={items} itemKey="name">
        {item => 
          (<Section items={item.children} title={item.name}>
            {item => <Item childItems={item.children}>{item.name}</Item>}
          </Section>)
        }
      </TreeView>
    )
  )
  .add(
    'Static',
    () => (
      <TreeView>
        <Item>One</Item>
        <Item>Two</Item>
        <Item title="Three">
          <Item>Four</Item>
          <Item title="Five">
            <Item>Six</Item>
          </Item>
        </Item>
      </TreeView>
    )
  )
  .add(
    'Static sections',
    () => (
      <TreeView>
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
      </TreeView>
    )
  );
