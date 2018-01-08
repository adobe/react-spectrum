import {action, storiesOf} from '@storybook/react';
import Radio from '../src/Radio';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Radio', module)
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
    'disabled: true',
    () => render({disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'invalid: true',
    () => render({invalid: true}),
    {inline: true}
  )
  .addWithInfo(
     'Label Not Set',
     () => render({label: '', 'aria-label': 'React'}),
     {inline: true}
  );

function render(props = {}) {
  return (
    <Radio
      label="React"
      onChange={action('change')}
      {...props} />
  );
}
