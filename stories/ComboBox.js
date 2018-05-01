import Bell from '../src/Icon/Bell';
import ComboBox from '../src/ComboBox';
import React from 'react';
import Seat from '../src/Icon/Seat';
import Send from '../src/Icon/Send';
import Stop from '../src/Icon/Stop';
import {storiesOf} from '@storybook/react';
import Trap from '../src/Icon/Trap';
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

const OPTION_ICONS = [
  {label: 'Bell', icon: <Bell />},
  {label: 'Stop', icon: <Stop />},
  {label: 'Trap', icon: <Trap />},
  {label: 'Send', icon: <Send />},
  {label: 'Seat', icon: <Seat />}
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
      <ComboBox options={OPTIONS} aria-label="Default" placeholder="Combo Box" />
    ),
    {inline: true}
  )
  .addWithInfo(
    'invalid',
    () => (
      <ComboBox options={OPTIONS} aria-label="invalid" placeholder="Combo Box" invalid />
    ),
    {inline: true}
  )
   .addWithInfo(
    'disabled',
    () => (
      <ComboBox options={OPTIONS} aria-label="disabled" placeholder="Combo Box" disabled />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => (
      <ComboBox options={OPTIONS} aria-label="quiet" placeholder="Combo Box" quiet />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet invalid',
    () => (
      <ComboBox options={OPTIONS} aria-label="quiet invalid" placeholder="Combo Box" quiet invalid />
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => (
      <ComboBox options={OPTIONS} aria-label="quiet disabled" placeholder="Combo Box" quiet disabled />
    ),
    {inline: true}
  )
  .addWithInfo(
    'with icons',
    () => (
      <ComboBox options={OPTION_ICONS} aria-label="with icons" placeholder="Combo Box" />
    ),
    {inline: true}
  );
