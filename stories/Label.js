import Label from '../src/Label';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Label', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => render({size: 'L'}),
    {inline: true}
  ).addWithInfo(
    'variant: grey',
    () => render({variant: 'grey'}),
    {inline: true}
  ).addWithInfo(
    'variant: green',
    () => render({variant: 'green'}),
    {inline: true}
  ).addWithInfo(
    'variant: blue',
    () => render({variant: 'blue'}),
    {inline: true}
  ).addWithInfo(
    'variant: red',
    () => render({variant: 'red'}),
    {inline: true}
  ).addWithInfo(
    'variant: orange',
    () => render({variant: 'or'}),
    {inline: true}
  ).addWithInfo(
    'variant: and',
    () => render({variant: 'and'}),
    {inline: true}
  ).addWithInfo(
    'variant: or',
    () => render({variant: 'or'}),
    {inline: true}
  ).addWithInfo(
    'variant: active',
    () => render({variant: 'active'}),
    {inline: true}
  ).addWithInfo(
    'variant: inactive',
    () => render({variant: 'inactive'}),
    {inline: true}
  );

function render(props = {}) {
  return (<Label {...props}>Spectrum Label</Label>);
}
