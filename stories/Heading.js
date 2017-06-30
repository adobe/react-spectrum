import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import Heading from '../src/Heading';

storiesOf('Heading', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'h1',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'h2',
    () => render({size: 2}),
    {inline: true}
  )
  .addWithInfo(
    'h3',
    () => render({size: 3}),
    {inline: true}
  )
  .addWithInfo(
    'h4',
    () => render({size: 4}),
    {inline: true}
  )
  .addWithInfo(
    'h5',
    () => render({size: 5}),
    {inline: true}
  )
  .addWithInfo(
    'h6',
    () => render({size: 6}),
    {inline: true}
  );

function render(props = {}) {
  return <Heading {...props}>React</Heading>;
}
