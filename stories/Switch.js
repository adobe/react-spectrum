import {action, storiesOf} from '@storybook/react';
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
    () => (render({'aria-label': 'React'})),
    {inline: true}
  )
  .addWithInfo(
    'defaultChecked: true',
    () => (render({defaultChecked: true, 'aria-label': 'React'})),
    {inline: true}
  )
  .addWithInfo(
    'checked: true',
    () => (render({checked: true, 'aria-label': 'React'})),
    {inline: true}
  )
  .addWithInfo(
    'checked: false',
    () => (render({checked: false, 'aria-label': 'React'})),
    {inline: true}
  )
  .addWithInfo(
    'disabled: true',
    () => (render({disabled: true, 'aria-label': 'React'})),
    {inline: true}
  )
  .addWithInfo(
    'with label',
    () => (render({label: 'Test'})),
    {inline: true}
  )
  .addWithInfo(
    'variant: ab',
    () => (render({variant: 'ab', 'aria-label': 'React'})),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Switch
      onChange={action('change')}
      {...props} />
  );
}
