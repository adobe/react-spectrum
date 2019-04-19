import {action} from '@storybook/addon-actions';
import Rating from '../src/Rating';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Rating', module)
  .add(
    'Default',
    () => (
      <Rating aria-label="Default rating" onChange={action('change')} />
    )
  )
  .add(
    'Disabled',
    () => (
      <Rating aria-label="Disabled rating" disabled value={3} onChange={action('change')} />
    )
  )
  .add(
    'Controlled',
    () => (
      <Rating aria-label="Controlled rating" value={3} onChange={action('change')} />
    )
  );
