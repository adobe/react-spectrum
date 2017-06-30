import ComboBox from '../src/ComboBox';
import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

const OPTIONS = [
  'Chocolate',
  'Vanilla',
  'Strawberry',
  'Caramel',
  'Cookies and Cream',
  'Coconut',
  'Peppermint',
  'Some crazy long value that should be cut off'
];

storiesOf('ComboBox', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" />
    ),
    {inline: true}
  )
  .addWithInfo(
    'icon: filter',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" icon="filter" />
    ),
    {inline: true}
  )
  .addWithInfo(
    'invalid',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" invalid />
    ),
    {inline: true}
  )
   .addWithInfo(
    'disabled',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" disabled />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" quiet />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet with icon: filter',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" quiet icon="filter" />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet invalid',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" quiet invalid />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => (
      <ComboBox options={OPTIONS} placeholder="Combo Box" quiet disabled />
    ),
    {inline: true}
  );
