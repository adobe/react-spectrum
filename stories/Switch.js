import {action, storiesOf} from '@kadira/storybook';
import React from 'react';
import Switch from '../src/Switch';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Switch', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (render()),
    {inline: true}
  )
  .addWithInfo(
    'defaultChecked: true',
    () => (render({defaultChecked: true})),
    {inline: true}
  )
  .addWithInfo(
    'checked: true',
    () => (render({checked: true})),
    {inline: true}
  )
  .addWithInfo(
    'checked: false',
    () => (render({checked: false})),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => (render({disabled: true})),
    {inline: true}
  )
  .addWithInfo(
    'with label',
    () => (render({label: 'Test'})),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props}
    />
  );
}
