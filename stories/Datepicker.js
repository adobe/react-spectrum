import {action} from '@storybook/addon-actions';
import Datepicker from '../src/Datepicker';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Datepicker', module)
  .add(
    'Default',
    () => render({'aria-label': 'Default'})
  )
  .add(
    'Default controlled',
    () => render({value: 'today', 'aria-label': 'Default controlled'})
  )
  .add(
    'type=datetime',
    () => render({type: 'datetime', 'aria-label': 'type=datetime'})
  )
  .add(
    'type=datetime controlled',
    () => render({type: 'datetime', value: 'today', 'aria-label': 'type=datetime controlled'})
  )
  .add(
    'type=datetime with AM/PM',
    () => render({type: 'datetime', defaultValue: 'today', 'aria-label': 'type=datetime', displayFormat: 'YYYY-MM-DD hh:mm a'})
  )
  .add(
    'type=time',
    () => render({type: 'time', placeholder: 'Choose a time', 'aria-label': 'type=time'})
  )
  .add(
    'type=time controlled',
    () => render({type: 'time', value: 'today', 'aria-label': 'type=time controlled'})
  )
  .add(
    'type=time with AM/PM',
    () => render({type: 'time', placeholder: 'hh:mm am/pm', 'aria-label': 'type=time', displayFormat: 'hh:mm a'})
  )
  .add(
    'startDay=1',
    () => render({startDay: 1, 'aria-label': 'startDay=1'})
  )
  .add(
    'quiet=true',
    () => render({quiet: true, 'aria-label': 'quiet=true'})
  )
  .add(
    'value=2015-01-15 02:15',
    () => render({type: 'datetime', value: '2015-01-15 02:15', 'aria-label': 'value=2015-01-15 02:15'})
  )
  .add(
    'invalid=true',
    () => render({invalid: true, 'aria-label': 'invalid=true'})
  )
  .add(
    'required=true',
    () => render({required: true, 'aria-label': 'required=true'})
  )
  .add(
    'disabled=true',
    () => render({disabled: true, 'aria-label': 'disabled=true'})
  )
  .add(
    'readOnly=true',
    () => render({readOnly: true, value: '2015-01-15', 'aria-label': 'readOnly=true'})
  )
  .add(
    'placeholder=foo',
    () => render({placeholder: 'foo', 'aria-label': 'placeholder=foo'})
  )
  .add(
    'with placement',
    () => render({type: 'datetime', placement: 'bottom', 'aria-label': 'with placement'})
  )
  .add(
    'selectionType="range"',
    () => render({selectionType: 'range', 'aria-label': 'selectionType="range"'})
  )
  .add(
    'selectionType="range" with value',
    () => render({selectionType: 'range', value: ['2018-10-01', '2018-10-30'], 'aria-label': 'selectionType="range" with value'})
  )
  .add(
    'selectionType="range" disabled',
    () => render({selectionType: 'range', disabled: true, 'aria-label': 'selectionType="range" disabled'})
  )
  .add(
    'selectionType="range" invalid',
    () => render({selectionType: 'range', invalid: true, value: ['2018-10-25', '2018-10-05'], 'aria-label': 'selectionType="range" invalid'})
  )
  .add(
    'selectionType="range" and quiet',
    () => render({selectionType: 'range', quiet: true, 'aria-label': 'selectionType="range" and quiet'})
  )
  .add(
    'selectionType="range" and quiet with value',
    () => render({selectionType: 'range', quiet: true, value: ['2018-10-01', '2018-10-30'], 'aria-label': 'selectionType="range" and quiet with value'})
  )
  .add(
    'selectionType="range" and quiet disabled',
    () => render({selectionType: 'range', quiet: true, disabled: true, 'aria-label': 'selectionType="range" and quiet disabled'})
  )
  .add(
    'selectionType="range" and quiet readOnly',
    () => render({selectionType: 'range', quiet: true, readOnly: true, value: ['2018-10-01', '2018-10-30'], 'aria-label': 'selectionType="range" with value'})
  )
  .add(
    'selectionType="range" and quiet invalid',
    () => render({selectionType: 'range', quiet: true, invalid: true, value: ['2018-10-25', '2018-10-05'], 'aria-label': 'selectionType="range" and quiet invalid'})
  )
  .add(
    'selectionType="range" and type="datetime"',
    () => render({
      selectionType: 'range',
      type: 'datetime',
      'aria-label': 'selectionType="range" and type="datetime"',
      displayFormat: 'YYYY-MM-DD hh:mm a',
      placeholder: 'yyyy-mm-dd hh:mm a'
    })
  )
  .add(
    'selectionType="range" and type="datetime" with value',
    () => render({
      selectionType: 'range',
      type: 'datetime',
      value: ['2018-10-01 00:30', '2018-10-30 17:30'],
      'aria-label': 'selectionType="range" and type="datetime" with value',
      displayFormat: 'YYYY-MM-DD hh:mm a',
      placeholder: 'yyyy-mm-dd hh:mm a'
    })
  )
  .add(
    'selectionType="range" and type="time"',
    () => render({
      selectionType: 'range',
      type: 'time',
      'aria-label': 'selectionType="range" and type="time"',
      displayFormat: 'hh:mm a',
      placeholder: 'hh:mm a'
    })
  )
  .add(
    'selectionType="range" and type="time" with value',
    () => render({
      selectionType: 'range',
      type: 'time',
      value: ['00:30', '17:30'],
      'aria-label': 'selectionType="range" and type="time" with value',
      displayFormat: 'hh:mm a',
      placeholder: 'hh:mm a'
    })
  )
  .add(
    'Labeled with FieldLabel',
    () => renderWithFieldLabel({selectionType: 'range'})
  )
  .add(
    'Max',
    () => renderWithFieldLabel({max: 'today'})
  )
  .add(
    'Min',
    () => renderWithFieldLabel({min: 'today'})
  )
  .add(
    'displayFormat and valueFormat',
    () => render({type: 'datetime', defaultValue: 'today', displayFormat: 'YYYY-MM-DD hh:mm a', valueFormat: 'MMMM YYYY HH:mm'})
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
