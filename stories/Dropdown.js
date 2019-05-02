import {action, storiesOf} from '@storybook/react';
import Brush from '../src/Icon/Brush';
import Button from '../src/Button';
import ColorPalette from '../src/Icon/ColorPalette';
import Dropdown from '../src/Dropdown';
import {Menu, MenuItem, SubMenu} from '../src/Menu';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Dropdown', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'alignRight',
    () => render({alignRight: true, style: {display: 'inline-block'}}),
    {inline: true}
  )
  .addWithInfo(
    'Stay open on select',
    () => render({closeOnSelect: false}),
    {inline: true}
  )
  .addWithInfo(
    'Tool with holdAffordance',
    () => (
      <Dropdown trigger="longClick" onClick={action('click')} onLongClick={action('longClick')} onSelect={action('select')}>
        <Button holdAffordance variant="tool" icon={<Brush />} />
        <Menu>
          <MenuItem icon={<Brush />} value="brush" selected>Brush</MenuItem>
          <MenuItem icon={<ColorPalette />} value="colorPalette">Color Palette</MenuItem>
        </Menu>
      </Dropdown>
    ),
    {inline: true}
  )
  .addWithInfo(
    'No flip',
    () => render({flip: false}),
    {inline: true}
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
