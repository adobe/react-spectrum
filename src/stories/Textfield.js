import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Textfield from '../Textfield';

storiesOf('Textfield', module)
  .add('Default', () => render())
  .add('quiet: true', () => render({ quiet: true }))
  .add('disabled: true', () => render({ disabled: true }))
  .add('invalid: true', () => render({ invalid: true }))
  .add('readOnly: true', () => render({ readOnly: true }))
  .add('required: true', () => render({ required: true }));

function render(props = {}) {
  return (
    <Textfield
      placeholder="React"
      onChange={ action('change') }
      onFocus={ action('focus') }
      onBlur={ action('blur') }
      { ...props }
    />
  );
}
