import React from 'react';
import moment from 'moment';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../.storybook/layout';

import Calendar from '../src/Calendar';

storiesOf('Calendar', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({ value: 'today' }),
    { inline: true }
  )
  .addWithInfo(
    'startDay=1',
    () => render({ startDay: 1, value: 'today' }),
    { inline: true }
  )
  .addWithInfo(
    'uncontrolled',
    () => render({ defaultValue: 'today' }),
    { inline: true }
  )
  .addWithInfo(
    'min=today, max=one week',
    () => render({ min: 'today', max: moment().date(moment().date() + 7).format('YYYY-MM-DD') }),
    { inline: true }
  )
  .addWithInfo(
    'value=2015-01-15',
    () => render({ type: 'datetime', value: '2015-01-15' }),
    { inline: true }
  )
  .addWithInfo(
    'headerFormat=M/YYYY',
    () => render({ headerFormat: 'M/YYYY' }),
    { inline: true }
  )
  .addWithInfo(
    'disabled=true',
    () => render({ disabled: true }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Calendar
      onChange={ action('change') }
      { ...props }
    />
  );
}
