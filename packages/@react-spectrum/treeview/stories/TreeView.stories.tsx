import React from 'react';
import {TreeView} from '../src';
import {storiesOf} from '@storybook/react';
import {Tree, Item} from '@react-stately/collections';
import { action } from '@storybook/addon-actions';

storiesOf('TreeView', module)
  .add(
    'Default',
    () => render({
      defaultTree: new Tree(
        new Item({value: 'Item 1'}),
        new Item({value: 'Item 2'},
          new Item({value: 'Child 1'})
        )
      ),
      onChange: action('change')
    })
  );

function render(props = {}) {
  return <TreeView {...props}></TreeView>;
}
