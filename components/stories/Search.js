import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Search from '../Search';

storiesOf('Search', module)
  .add('Default', () => render())
  .add('defaultValue (uncontrolled)', () => render({ defaultValue: 'React' }))
  .add('value (controlled)', () => render({ value: 'React' }))
  .add('disabled: true', () => render({ value: 'React', disabled: true }));

function render(props = {}) {
  return (
    <Search
      placeholder="Enter text"
      { ...props }
      onChange={action('change')}
      onSubmit={action('submit')}
      onClear={action('clear')}
    />
  );
}
