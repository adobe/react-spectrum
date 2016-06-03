import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Search from '../Search';

storiesOf('Search', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('defaultValue (uncontrolled)', () => render({ defaultValue: 'React' }))
  .add('value (controlled)', () => render({ value: 'React' }))
  .add('clearable: false', () => render({ clearable: false, value: 'React' }))
  .add('disabled: true', () => render({ value: 'React', disabled: true }));

function render(props = {}) {
  return (
    <Search
      placeholder="Enter text"
      { ...props }
      onChange={ action('change') }
      onSubmit={ action('submit') }
      onClear={ action('clear') }
    />
  );
}
