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
    () => render({variant: 'subtle'}),
    {inline: true}
  )
  .addWithInfo(
    'Over background',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground'})}
      </div>
    ),
    {inline: true}
  );

function render(props = {}) {
  return (<Link href="#" {...props}>This is a React Spectrum Link</Link>);
}
