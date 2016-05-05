import React from 'react';
import { storiesOf } from '@kadira/storybook';

import Heading from '../Heading';

storiesOf('Heading', module)
  .add('h1', () => ( render() ))
  .add('h2', () => ( render({ size: 2 }) ))
  .add('h3', () => ( render({ size: 3 }) ))
  .add('h4', () => ( render({ size: 4 }) ))
  .add('h5', () => ( render({ size: 5 }) ))
  .add('h6', () => ( render({ size: 6 }) ))

function render(props = {}) {
  return <Heading { ...props }>React</Heading>;
}
