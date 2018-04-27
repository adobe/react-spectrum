import Bell from '../src/Icon/Bell';
import ComboBox from '../src/ComboBox';
import FieldLabel from '../src/FieldLabel';
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
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTIONS} placeholder="Combo Box" />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'invalid',
    () => (
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTIONS} placeholder="Combo Box" invalid />
      </FieldLabel>
    ),
    {inline: true}
  )
   .addWithInfo(
    'disabled',
    () => (
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTIONS} placeholder="Combo Box" disabled />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => (
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTIONS} placeholder="Combo Box" quiet />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet invalid',
    () => (
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTIONS} placeholder="Combo Box" quiet invalid />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => (
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTIONS} placeholder="Combo Box" quiet disabled />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'with icons',
    () => (
      <FieldLabel label="Combo Box">
        <ComboBox options={OPTION_ICONS} placeholder="Combo Box" />
      </FieldLabel>
    ),
    {inline: true}
  ).addWithInfo(
    'labelled with FieldLabel and labelFor',
    () => (
      <div>
        <FieldLabel label="Combo Box" labelFor="combobox-id" />
        <ComboBox id="combobox-id" options={OPTION_ICONS} placeholder="Combo Box" />
      </div>
    ),
    {inline: true}
  ).addWithInfo(
    'labelled with aria-label',
    () => (
      <ComboBox aria-label="Combo Box" options={OPTION_ICONS} placeholder="Combo Box" />
    ),
    {inline: true}
  );
