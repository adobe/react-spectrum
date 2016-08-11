import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Wait from '../Wait';

storiesOf('Wait', module)
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
    'large: true',
    () => render({ large: true }),
    { inline: true }
  )
  .addWithInfo(
    'centered: true',
    () => render({ centered: true }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Wait { ...props } />
  );
}
