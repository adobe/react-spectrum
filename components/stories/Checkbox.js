import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Checkbox from '../Checkbox';

storiesOf('Checkbox', module)
  .add('Default', () => (render()))
  .add('defaultChecked: true', () => (render({ defaultChecked: true })))
  .add('checked: true', () => (render({ checked: true })))
  .add('checked: false', () => (render({ checked: false })))
  .add('indeterminate: true', () => (render({ indeterminate: true })))
  .add('disabled: true', () => (render({ disabled: true })));

function render(props = {}) {
  return (
    <Checkbox
      label="React"
      onChange={ action('change') }
      { ...props }
    />
  );
}
