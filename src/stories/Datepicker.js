import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Datepicker from '../Datepicker';

storiesOf('Datepicker', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'Default controlled',
    () => render({ value: 'today' }),
    { inline: true }
  )
  .addWithInfo(
    'type=datetime',
    () => render({ type: 'datetime' }),
    { inline: true }
  )
  .addWithInfo(
    'type=datetime controlled',
    () => render({ type: 'datetime', value: 'today' }),
    { inline: true }
  )
  .addWithInfo(
    'type=time',
    () => render({ type: 'time' }),
    { inline: true }
  )
  .addWithInfo(
    'type=time controlled',
    () => render({ type: 'time', value: 'today' }),
    { inline: true }
  )
  .addWithInfo(
    'startDay=1',
    () => render({ startDay: 1 }),
    { inline: true }
  )
  .addWithInfo(
    'quiet=true',
    () => render({ quiet: true }),
    { inline: true }
  )
  .addWithInfo(
    'value=2015-01-15T02:15-07:00',
    () => render({ type: 'datetime', value: '2015-01-15T02:15-07:00' }),
    { inline: true }
  )
  .addWithInfo(
    'invalid=true',
    () => render({ invalid: true }),
    { inline: true }
  )
  .addWithInfo(
    'disabled=true',
    () => render({ disabled: true }),
    { inline: true }
  )
  .addWithInfo(
    'readOnly=true',
    () => render({ readOnly: true }),
    { inline: true }
  )
  .addWithInfo(
    'placeholder=foo',
    () => render({ placeholder: 'foo', value: '' }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Datepicker
      onChange={ action('change') }
      { ...props }
    />
  );
}
