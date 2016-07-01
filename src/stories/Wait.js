import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Wait from '../Wait';

storiesOf('Wait', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('large: true', () => render({ large: true }))
  .add('centered: true', () => render({ centered: true }));

function render(props = {}) {
  return (
    <Wait { ...props } />
  );
}
