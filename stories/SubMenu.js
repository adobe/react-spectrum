import {action, storiesOf} from '@storybook/react';
import {Menu, MenuHeading, MenuItem, SubMenu} from '../src/Menu';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('SubMenu', module)
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
    'Multi-level',
    () => render(true),
    {inline: true}
  );

function render(multiLevel) {
  return (
    <Menu onSelect={action('selectMenu')}>
      <MenuHeading> Menu Heading 1 </MenuHeading>
      <MenuItem value="1">Menu Item 1</MenuItem>
      <MenuItem value="2">Menu Item 2</MenuItem>
      <MenuItem value="3">Menu Item 3</MenuItem>
      <SubMenu label="Sub Menu 1">
        <MenuItem value="0.1">Sub Menu Item 1</MenuItem>
        <MenuItem value="0.2">Sub Menu Item 2</MenuItem>
        {multiLevel && <SubMenu label="Sub Menu Item 3">
          <MenuItem value="0.3.1">Sub Menu Item 1</MenuItem>
          <MenuItem value="0.3.2">Sub Menu Item 2</MenuItem>
        </SubMenu>}
      </SubMenu>
      <MenuItem value="4">Menu Item 4</MenuItem>
    </Menu>
  );
}
