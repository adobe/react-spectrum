import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Checkbox from '../Checkbox';

storiesOf('Checkbox', module)
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
    'defaultChecked: true',
    () => render({ defaultChecked: true }),
    { inline: true }
  )
  .addWithInfo(
    'checked: true',
    () => render({ checked: true }),
    { inline: true }
  )
  .addWithInfo(
    'checked: false',
    () => render({ checked: false }),
    { inline: true }
  )
  .addWithInfo(
    'indeterminate: true',
    () => render({ indeterminate: true }),
    { inline: true }
  )
  .addWithInfo(
    'disabled: true',
    () => render({ disabled: true }),
    { inline: true }
  )
  .addWithInfo(
    'Label Not Set',
    () => render({ label: '' }),
    { inline: true }
  );

function render(props = {}) {
  return (
    <Checkbox
      label="React"
      onChange={ action('change') }
      { ...props }
    />
  );
}
