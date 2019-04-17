import {Menu, MenuDivider, MenuHeading, MenuItem} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Menu', module)
  .addDecorator(story => (
    <div className="popover-story">
      {story()}
    </div>
  ))
  .add(
    'Default',
    () => render()
  )
  .add(
    'trapFocus: false',
    () => render({trapFocus: false}),
    {info: '<p>By default, the menu has <code>trapFocus: true</code>, which prevents focus to the next item outside of the menu. Setting <code>trapFocus: false</code>, allows focus to move to the next focusable element in the DOM.</p>'}
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
