import {action, storiesOf} from '@storybook/react';
import Datepicker from '../src/Datepicker';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Datepicker', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({'aria-label': 'Default'}),
    {inline: true}
  )
  .addWithInfo(
    'Default controlled',
    () => render({value: 'today', 'aria-label': 'Default controlled'}),
    {inline: true}
  )
  .addWithInfo(
    'type=datetime',
    () => render({type: 'datetime', 'aria-label': 'type=datetime'}),
    {inline: true}
  )
  .addWithInfo(
    'type=datetime controlled',
    () => render({type: 'datetime', value: 'today', 'aria-label': 'type=datetime controlled'}),
    {inline: true}
  )
  .addWithInfo(
    'type=datetime with AM/PM',
    () => render({type: 'datetime', defaultValue: 'today', 'aria-label': 'type=datetime', displayFormat: 'YYYY-MM-DD hh:mm a'}),
    {inline: true}
  )
  .addWithInfo(
    'type=time',
    () => render({type: 'time', placeholder: 'Choose a time', 'aria-label': 'type=time'}),
    {inline: true}
  )
  .addWithInfo(
    'type=time controlled',
    () => render({type: 'time', value: 'today', 'aria-label': 'type=time controlled'}),
    {inline: true}
  )
  .addWithInfo(
    'type=time with AM/PM',
    () => render({type: 'time', placeholder: 'hh:mm am/pm', 'aria-label': 'type=time', displayFormat: 'hh:mm a'}),
    {inline: true}
  )
  .addWithInfo(
    'startDay=1',
    () => render({startDay: 1, 'aria-label': 'startDay=1'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet=true',
    () => render({quiet: true, 'aria-label': 'quiet=true'}),
    {inline: true}
  )
  .addWithInfo(
    'value=2015-01-15 02:15',
    () => render({type: 'datetime', value: '2015-01-15 02:15', 'aria-label': 'value=2015-01-15 02:15'}),
    {inline: true}
  )
  .addWithInfo(
    'invalid=true',
    () => render({invalid: true, 'aria-label': 'invalid=true'}),
    {inline: true}
  )
  .addWithInfo(
    'disabled=true',
    () => render({disabled: true, 'aria-label': 'disabled=true'}),
    {inline: true}
  )
  .addWithInfo(
    'readOnly=true',
    () => render({readOnly: true, value: '2015-01-15', 'aria-label': 'readOnly=true'}),
    {inline: true}
  )
  .addWithInfo(
    'placeholder=foo',
    () => render({placeholder: 'foo', 'aria-label': 'placeholder=foo'}),
    {inline: true}
  )
  .addWithInfo(
    'with placement',
    () => render({type: 'datetime', placement: 'bottom', 'aria-label': 'with placement'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range"',
    () => render({selectionType: 'range', 'aria-label': 'selectionType="range"'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" with value',
    () => render({selectionType: 'range', value: ['2018-10-01', '2018-10-30'], 'aria-label': 'selectionType="range" with value'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" disabled',
    () => render({selectionType: 'range', disabled: true, 'aria-label': 'selectionType="range" disabled'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" invalid',
    () => render({selectionType: 'range', invalid: true, value: ['2018-10-25', '2018-10-05'], 'aria-label': 'selectionType="range" invalid'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and quiet',
    () => render({selectionType: 'range', quiet: true, 'aria-label': 'selectionType="range" and quiet'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and quiet with value',
    () => render({selectionType: 'range', quiet: true, value: ['2018-10-01', '2018-10-30'], 'aria-label': 'selectionType="range" and quiet with value'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and quiet disabled',
    () => render({selectionType: 'range', quiet: true, disabled: true, 'aria-label': 'selectionType="range" and quiet disabled'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and quiet readOnly',
    () => render({selectionType: 'range', quiet: true, readOnly: true, value: ['2018-10-01', '2018-10-30'], 'aria-label': 'selectionType="range" with value'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and quiet invalid',
    () => render({selectionType: 'range', quiet: true, invalid: true, value: ['2018-10-25', '2018-10-05'], 'aria-label': 'selectionType="range" and quiet invalid'}),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and type="datetime"',
    () => render({
      selectionType: 'range',
      type: 'datetime',
      'aria-label': 'selectionType="range" and type="datetime"',
      displayFormat: 'YYYY-MM-DD hh:mm a',
      placeholder: 'yyyy-mm-dd hh:mm a'
    }),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and type="datetime" with value',
    () => render({
      selectionType: 'range',
      type: 'datetime',
      value: ['2018-10-01 00:30', '2018-10-30 17:30'],
      'aria-label': 'selectionType="range" and type="datetime" with value',
      displayFormat: 'YYYY-MM-DD hh:mm a',
      placeholder: 'yyyy-mm-dd hh:mm a'
    }),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and type="time"',
    () => render({
      selectionType: 'range',
      type: 'time',
      'aria-label': 'selectionType="range" and type="time"',
      displayFormat: 'hh:mm a',
      placeholder: 'hh:mm a'
    }),
    {inline: true}
  )
  .addWithInfo(
    'selectionType="range" and type="time" with value',
    () => render({
      selectionType: 'range',
      type: 'time',
      value: ['00:30', '17:30'],
      'aria-label': 'selectionType="range" and type="time" with value',
      displayFormat: 'hh:mm a',
      placeholder: 'hh:mm a'
    }),
    {inline: true}
  )
  .addWithInfo(
    'Labeled with FieldLabel',
    () => renderWithFieldLabel({selectionType: 'range'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Datepicker
      onChange={action('change')}
      {...props} />
  );
}

function renderWithFieldLabel(props = {}) {
  return (
    <FieldLabel label="Datepicker">
      <Datepicker
        onChange={action('change')}
        {...props} />
    </FieldLabel>
  );
}
