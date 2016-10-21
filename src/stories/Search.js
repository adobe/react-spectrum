import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Search from '../Search';

storiesOf('Search', module)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    { inline: true }
  )
  .addWithInfo(
    'defaultValue (uncontrolled)',
    () => render({ defaultValue: 'React' }),
    { inline: true }
  )
  .addWithInfo(
    'value (controlled)',
    () => render({ value: 'React' }),
    { inline: true }
  )
  .addWithInfo(
    'clearable: false',
    () => render({ clearable: false, value: 'React' }),
    { inline: true }
  )
  .addWithInfo(
    'disabled: true',
    () => render({ value: 'React', disabled: true }),
    { inline: true }
  )
  .addWithInfo(
    'icon: refresh',
    () => render({ value: 'React', icon: 'refresh' }),
    { inline: true }
  )
  .addWithInfo(
    'icon: (none)',
    () => render({ value: 'React', icon: '' }),
    { inline: true }
  );

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
