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
  )
  .addWithInfo(
    'trapFocus: false',
    '<p>By default, the menu has <code>trapFocus: true</code>, which prevents focus to the next item outside of the menu. Setting <code>trapFocus: false</code>, allows focus to move to the next focusable element in the DOM.</p>',
    () => render({trapFocus: false}),
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
