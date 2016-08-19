import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Calendar from '../Calendar';

storiesOf('Calendar', module)
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
    'startDay=1',
    () => render({ startDay: 1 }),
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
