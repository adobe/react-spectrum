import {action} from '@storybook/addon-actions';
// import {Button} from '@react-spectrum/button';
import {Menu, MenuDivider, MenuHeading, MenuItem, V3Menu} from '../';
// import {MenuTrigger} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Menu', module)
  .add(
    'default',
    () => (
      <V3Menu>
        <MenuHeading>Heading 1</MenuHeading>
        <MenuItem>blah</MenuItem>
        <MenuItem>blah1</MenuItem>
        <MenuItem>blah2</MenuItem>
        <MenuDivider />
        <MenuHeading>Heading 2</MenuHeading>
        <MenuItem>heh</MenuItem>
        <MenuItem>heh1</MenuItem>
        <MenuItem>heh2</MenuItem>
        <MenuDivider />
      </V3Menu>   
    )
  )
  .add(
    'align="end"',
    () => render({align: 'end'})
  )
  .add(
    'direction="top"',
    () => render({direction: 'top'})
  )
  .add(
    'shouldFlip',
    () => render({shouldFlip: true})
  )
  .add(
    'isOpen',
    () => render({isOpen: true})
  )
  .add(
    'defaultOpen',
    () => render({defaultOpen: true})
  )
  .add(
    'trigger="longPress" TODO out of scope',
    () => render()
  )
  .add(
    'menu+submenus TODO out of scope',
    () => render()
  )
  .add(
    'popup with role=listbox',
    () => render({}, {role: 'listbox'})
  );
  
function render(props = {}, menuProps = {}) {
  return (
    <div>filler</div>
  );
}
