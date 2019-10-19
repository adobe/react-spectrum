import React from 'react';
import {TreeView, Item, Section} from '../src';
import {storiesOf} from '@storybook/react';
// import {Tree, Item} from '@react-stately/collections';
import { action } from '@storybook/addon-actions';

// let items = [];
// for (let i = 0; i < 10; i++) {
//   items.push({id: i, value: 'Item ' + i});
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
          <Section items={item.children}>
            {item => <Item>{item.name}</Item>}
          </Section>
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
        <Item>Three</Item>
      </TreeView>
    )
  );

function render(props = {}) {
  return <TreeView {...props}></TreeView>;
}
