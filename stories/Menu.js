import {Menu, MenuDivider, MenuHeading, MenuItem} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Menu', module)
  .addDecorator(story => (
    <VerticalCenter className="popover-story" style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Menu {...props} open>
      <MenuHeading>Menu Heading 1</MenuHeading>
      <MenuItem>Menu Item 1</MenuItem>
      <MenuHeading label="Menu Heading 2" />
      <MenuItem>Menu Item 2</MenuItem>
      <MenuDivider />
      <MenuItem>Menu Item 3</MenuItem>
    </Menu>
  );
}
