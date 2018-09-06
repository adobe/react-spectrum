import {action, storiesOf} from '@storybook/react';
import React from 'react';
import Textfield from '../src/Textfield';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Textfield', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'invalid: true (deprecated)',
    () => render({invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'validationState: invalid',
    () => render({validationState: 'invalid'}),
    {inline: true}
  )
  .addWithInfo(
    'validationState: valid',
    () => render({validationState: 'valid'}),
    {inline: true}
  )
  .addWithInfo(
    'readOnly: true',
    () => render({readOnly: true}),
    {inline: true}
  )
  .addWithInfo(
    'required: true',
    () => render({required: true}),
    {inline: true}
  )
  .addWithInfo(
    'autoFocus: true',
    () => render({autoFocus: true}),
    {inline: true}
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
