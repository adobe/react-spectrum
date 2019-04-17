import Label from '../src/Label';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Label', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'size: L',
    () => render({size: 'L'})
  ).add(
    'variant: grey',
    () => render({variant: 'grey'})
  ).add(
    'variant: green',
    () => render({variant: 'green'})
  ).add(
    'variant: blue',
    () => render({variant: 'blue'})
  ).add(
    'variant: red',
    () => render({variant: 'red'})
  ).add(
    'variant: orange',
    () => render({variant: 'or'})
  ).add(
    'variant: and',
    () => render({variant: 'and'})
  ).add(
    'variant: or',
    () => render({variant: 'or'})
  ).add(
    'variant: active',
    () => render({variant: 'active'})
  ).add(
    'variant: inactive',
    () => render({variant: 'inactive'})
  );

function render(props = {}) {
  return (<Label {...props}>Spectrum Label</Label>);
}
