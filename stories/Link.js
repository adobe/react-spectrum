import Link from '../src/Link';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Link', module)
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
    'Subtle',
    () => render({subtle: true}),
    {inline: true}
  );

function render(props = {}) {
  return (<Link href="#" {...props}>This is a React Coral Link</Link>);
}
