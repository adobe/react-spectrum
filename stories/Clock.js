import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import Clock from '../src/Clock';

storiesOf('Clock', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({value: 'today'}),
    {inline: true}
  )
  .addWithInfo(
    'uncontrolled',
    () => render({defaultValue: 'today'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet=true',
    () => render({quiet: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Clock
      onChange={ action('change') }
      { ...props }
    />
  );
}
