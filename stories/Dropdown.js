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
import Brush from '../src/Icon/Brush';
import Button from '../src/Button';
import ColorPalette from '../src/Icon/ColorPalette';
import Dropdown from '../src/Dropdown';
import {Menu, MenuItem, SubMenu} from '../src/Menu';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Dropdown', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'alignRight',
    () => render({alignRight: true, style: {display: 'inline-block'}})
  )
  .add(
    'Stay open on select',
    () => render({closeOnSelect: false})
  )
  .add(
    'Tool with holdAffordance',
    () => (
      <Dropdown trigger="longClick" onClick={action('click')} onLongClick={action('longClick')} onSelect={action('select')}>
        <Button holdAffordance variant="tool" icon={<Brush />} />
        <Menu>
          <MenuItem icon={<Brush />} value="brush" selected>Brush</MenuItem>
          <MenuItem icon={<ColorPalette />} value="colorPalette">Color Palette</MenuItem>
        </Menu>
      </Dropdown>
    )
  )
  .add(
    'No flip',
    () => render({flip: false})
  );

function render(props = {}) {
  return (
    <Dropdown onSelect={action('select')} {...props}>
      <Button variant="cta">Test</Button>
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
