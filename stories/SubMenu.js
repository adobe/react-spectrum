/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import {Menu, MenuHeading, MenuItem, SubMenu} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('SubMenu', module)
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
    'Multi-level',
    () => render(true)
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
