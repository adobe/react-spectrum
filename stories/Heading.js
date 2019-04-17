import Heading from '../src/Heading';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Heading', module)
  .add(
    'display variant (default)',
    () => render()
  )
  .add(
    'pageTitle variant',
    () => render({variant: 'pageTitle'})
  )
  .add(
    'subtitle1 variant',
    () => render({variant: 'subtitle1'})
  )
  .add(
    'subtitle2 variant',
    () => render({variant: 'subtitle2'})
  )
  .add(
    'subtitle3 variant',
    () => render({variant: 'subtitle3'})
  );

function render(props = {}) {
  return <Heading {...props}>React</Heading>;
}
