import React from 'react';
import {TreeView} from '../src';
import {storiesOf} from '@storybook/react';

storiesOf('TreeView', module)
  .add(
    'Default',
    () => render()
  );

function render(props = {}) {
  return <TreeView {...props}></TreeView>;
}
