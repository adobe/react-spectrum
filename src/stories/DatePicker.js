import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import DatePicker from '../DatePicker';

storiesOf('DatePicker', module)
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
  )
  .addWithInfo(
    'quiet=true',
    () => render({ quiet: true }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <DatePicker
      onChange={ action('change') }
      { ...props }
    />
  );
}
