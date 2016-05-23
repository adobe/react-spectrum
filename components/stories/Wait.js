import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Wait from '../Wait';

storiesOf('Wait', module)
  .add('Default', () => render() )
  .add('large: true', () => render({ large: true }) )
  .add('centered: true', () => render({ centered: true }) )

function render(props = {}) {
  return (
    <Wait { ...props } />
  );
}
