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
