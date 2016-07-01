import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Switch from '../Switch';

storiesOf('Switch', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => (render()))
  .add('defaultChecked: true', () => (render({ defaultChecked: true })))
  .add('checked: true', () => (render({ checked: true })))
  .add('checked: false', () => (render({ checked: false })))
  .add('disabled: true', () => (render({ disabled: true })));

function render(props = {}) {
  return (
    <Switch
      onChange={ action('change') }
      { ...props }
    />
  );
}
