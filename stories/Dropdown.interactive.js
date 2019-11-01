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
import {boolean, withKnobs} from '@storybook/addon-knobs';
import Button from '../src/Button';
import Dropdown from '../src/Dropdown';
import {Menu, MenuItem, SubMenu} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';

/**
 * The following stories are used for showcasing the different props of the component.
 * The user can tweak the different values for the props and observe how the component responds in real time.
 */
storiesOf('Dropdown/interactive', module)
  .addDecorator(withKnobs)
  .add(
    'Dropdown',
    () => renderDropdown()
  );

function renderDropdown(props = {}) {
  return (
    <Dropdown
      onSelect={action('select')}
      closeOnSelect={boolean('closeOnSelect', true)}
      alignRight={boolean('alignRight', false)}
      style={{display: 'inline-block'}}
      flip={boolean('flip', false)}
      {...props}>
      <Button variant="cta">Dropdown Button</Button>
      <Menu>
        <MenuItem role="menuitemradio" value="foo">Foo</MenuItem>
        <MenuItem role="menuitemradio" value="bar" selected>Bar</MenuItem>
        <MenuItem role="menuitemradio" value="baz">Baz</MenuItem>
        <SubMenu label="zaa">
          <MenuItem value="1">zaa 1</MenuItem>
          <MenuItem value="2">zaa 2</MenuItem>
          <MenuItem value="3">zaa 3</MenuItem>
        </SubMenu>
      </Menu>
    </Dropdown>
  );
}
