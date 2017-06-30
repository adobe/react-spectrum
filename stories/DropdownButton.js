import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {MenuItem} from '../src/Menu';
import DropdownButton from '../src/DropdownButton';

storiesOf('DropdownButton', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({label: 'Action'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: primary',
    () => render({label: 'Action', variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'noArrow',
    () => render({label: 'Action', variant: 'primary', noArrow: true}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <DropdownButton {...props} onClick={action('click')} onSelect={action('select')}>
      <MenuItem icon="twitter">Twitter</MenuItem>
      <MenuItem icon="facebook">Facebook</MenuItem>
      <MenuItem icon="instagram">Instagram</MenuItem>
    </DropdownButton>
  );
}
