import {action} from '@storybook/addon-actions';
import {addWeeks} from 'date-fns';
import {RangeCalendar} from '../src';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('RangeCalendar', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'defaultValue',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}})
  )
  .add(
    'controlled value',
    () => render({value: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}})
  )
  .add(
    'minValue: today, maxValue: 1 week from now',
    () => render({minValue: new Date(), maxValue: addWeeks(new Date(), 1)})
  )
  .add(
    'isDisabled',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}, isDisabled: true})
  )
  .add(
    'isReadOnly',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}, isReadOnly: true})
  )
  .add(
    'autoFocus',
    () => render({defaultValue: {start: new Date(2019, 5, 5), end: new Date(2019, 5, 10)}, autoFocus: true})
  );

function render(props = {}) {
  return <RangeCalendar onChange={action('change')} {...props} />;
}
