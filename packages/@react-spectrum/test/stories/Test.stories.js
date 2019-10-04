import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Test from '../src/Test';

// TODO: REMOVE FILE
storiesOf('Selection/Multi Selection', module)
  .add('selection', () => (
    <Test onSelectionChange={action('onSelectionChange')} />
  ))
  .add('allows empty selection', () => (
    <Test onSelectionChange={action('onSelectionChange')} allowsEmptySelection />
  ))
  .add('use of defaultSelectedItems', () => (
    <Test defaultSelectedItems={[1, 2, 10]} onSelectionChange={action('onSelectionChange')} />
  ))
  .add('controlled with values', () => (
    <Test selectedItems={[1, 2, 10]} onSelectionChange={action('onSelectionChange')} />
  ));

storiesOf('Selection/Single Selection', module)
  .add('selection', () => (
    <Test single onSelectionChange={action('onSelectionChange')} />
  ))
  .add('allows empty selection', () => (
    <Test single onSelectionChange={action('onSelectionChange')} allowsEmptySelection />
  ))
  .add('defaultSelectedItem', () => (
    <Test single defaultSelectedItem={1} onSelectionChange={action('onSelectionChange')} />
  ))
  .add('controlled with values', () => (
    <Test single selectedItem={1} onSelectionChange={action('onSelectionChange')} />
  ));
