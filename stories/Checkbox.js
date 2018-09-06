import {action, storiesOf} from '@storybook/react';
import Checkbox from '../src/Checkbox';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Checkbox', module)
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
    'defaultChecked: true',
    () => render({defaultChecked: true}),
    {inline: true}
  )
  .addWithInfo(
    'checked: true',
    () => render({checked: true}),
    {inline: true}
  )
  .addWithInfo(
    'checked: false',
    () => render({checked: false}),
    {inline: true}
  )
  .addWithInfo(
    'indeterminate: true',
    () => render({indeterminate: true}),
    {inline: true}
  )
  .addWithInfo(
    'invalid: true',
    () => render({invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true',
    () => render({quiet: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, indeterminate: true',
    () => render({quiet: true, indeterminate: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, invalid: true',
    () => render({quiet: true, invalid: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, invalid: true, indeterminate: true',
    () => render({quiet: true, invalid: true, indeterminate: true}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, disabled: true',
    () => render({quiet: true, disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'Label Not Set',
    () => render({label: '', 'aria-label': 'React'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Checkbox
      label="React"
      onChange={action('change')}
      {...props} />
  );
}
