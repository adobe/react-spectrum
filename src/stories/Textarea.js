import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import Textarea from '../Textarea';

storiesOf('Textarea', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('quiet: true', () => render({ quiet: true }))
  .add('disabled: true', () => render({ disabled: true }))
  .add('invalid: true', () => render({ invalid: true }))
  .add('readOnly: true', () => render({ readOnly: true }))
  .add('required: true', () => render({ required: true }));

function render(props = {}) {
  return (
    <Textarea
      placeholder="React"
      onChange={ action('change') }
      onFocus={ action('focus') }
      onBlur={ action('blur') }
      { ...props }
    />
  );
}
