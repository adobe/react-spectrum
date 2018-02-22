import {action, storiesOf} from '@storybook/react';
import Rating from '../src/Rating';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Rating', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Rating aria-label="Default rating" onChange={action('change')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'Disabled',
    () => (
      <Rating aria-label="Disabled rating" disabled value={3} onChange={action('change')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'Controlled',
    () => (
      <Rating aria-label="Controlled rating" value={3} onChange={action('change')} />
    ),
    {inline: true}
  );
