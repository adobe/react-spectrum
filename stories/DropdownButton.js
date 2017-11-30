import {action, storiesOf} from '@storybook/react';
import DropdownButton from '../src/DropdownButton';
import {MenuItem} from '../src/Menu';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('DropdownButton', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 200px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({label: 'Action'}),
    {inline: true}
  )
  .addWithInfo(
    'Icon only',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'alignRight',
    () => render({alignRight: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => render({disabled: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <DropdownButton {...props} onClick={action('click')} onSelect={action('select')}>
      <MenuItem icon="twitter" value="twitter">Twitter</MenuItem>
      <MenuItem icon="facebook" value="facebook">Facebook</MenuItem>
      <MenuItem icon="instagram" value="instagram">Instagram</MenuItem>
    </DropdownButton>
  );
}
