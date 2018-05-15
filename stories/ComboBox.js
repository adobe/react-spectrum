import {action, storiesOf} from '@storybook/react';
import Bell from '../src/Icon/Bell';
import ComboBox from '../src/ComboBox';
import React from 'react';
import Seat from '../src/Icon/Seat';
import Send from '../src/Icon/Send';
import Stop from '../src/Icon/Stop';
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

const OPTIONS_KEY_PAIRS = [
  {label: 'Label 1', value: '1234'},
  {label: 'Label 2', value: '5678'},
  {label: 'Label 3', value: '9123'},
  {label: 'Label 4', value: '4567'},
  {label: 'Label 5', value: '8912'}
];

storiesOf('ComboBox', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({options: OPTIONS, 'aria-label': 'Default'}),
    {inline: true}
  )
  .addWithInfo(
    'invalid',
    () => render({options: OPTIONS, 'aria-label': 'invalid', invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => render({options: OPTIONS, 'aria-label': 'disabled', disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet',
    () => render({options: OPTIONS, 'aria-label': 'quiet', quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet invalid',
    () => render({options: OPTIONS, 'aria-label': 'quiet invalid', quiet: true, invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet disabled',
    () => render({options: OPTIONS, 'aria-label': 'quiet disabled', quiet: true, disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'Key Value Pairs',
    () => render({options: OPTIONS_KEY_PAIRS, 'aria-label': 'with key value pairs'}),
    {inline: true}
  )
  .addWithInfo(
    'with icons',
    () => render({options: OPTION_ICONS, 'aria-label': 'with icons'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <ComboBox
      onChange={action('change')}
      onSelect={action('select')}
      placeholder="Combo Box"
      {...props} />
  );
}
