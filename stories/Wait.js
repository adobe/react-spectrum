import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

import Wait from '../src/Wait';

storiesOf('Wait', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'size: S',
    () => render({size: 'S'}),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => render({size: 'L'}),
    {inline: true}
  )
  .addWithInfo(
    'centered: true',
    () => render({centered: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Wait {...props} />
  );
}
