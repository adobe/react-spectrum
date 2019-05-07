import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';

storiesOf('Textfield', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'quiet: true',
    () => render({quiet: true})
  )
  .add(
    'disabled: true',
    () => render({disabled: true})
  )
  .add(
    'invalid: true (deprecated)',
    () => render({invalid: true})
  )
  .add(
    'validationState: invalid',
    () => render({validationState: 'invalid'})
  )
  .add(
    'validationState: valid',
    () => render({validationState: 'valid'})
  )
  .add(
    'readOnly: true',
    () => render({readOnly: true})
  )
  .add(
    'required: true',
    () => render({required: true})
  )
  .add(
    'autoFocus: true',
    () => render({autoFocus: true})
  )
  .add(
    'multiLine: true',
    () => render({multiLine: true})
  );

function render(props = {}) {
  return (
    <Textfield
      placeholder="React"
      onChange={action('change')}
      onFocus={action('focus')}
      onBlur={action('blur')}
      {...props} />
  );
}
