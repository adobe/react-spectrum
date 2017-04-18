import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import Wait from '../src/Wait';

storiesOf('Wait', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'size: medium',
    () => render({size: 'M'}),
    {inline: true}
  )
  .addWithInfo(
    'size: large',
    () => render({size: 'L'}),
    {inline: true}
  )
  .addWithInfo(
    'centered: true',
    () => render({centered: true}),
    {inline: true}
  )
  .addWithInfo(
    'variant: dots',
    () => render({variant: 'dots'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Wait { ...props } />
  );
}
