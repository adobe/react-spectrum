import React from 'react';
import {TreeView} from '../src';
import {storiesOf} from '@storybook/react';
import {Tree, Item} from '@react-stately/collections';
import { action } from '@storybook/addon-actions';

let items = [];
for (let i = 0; i < 10000; i++) {
  items.push(new Item({value: 'Item ' + i}));
}

storiesOf('TreeView', module)
  .add(
    'Default',
    () => render({
      defaultTree: new Tree(
        ...items
      ),
      onChange: action('change')
    })
  );

function render(props = {}) {
  return <TreeView {...props}></TreeView>;
}
