import {action, storiesOf} from '@kadira/storybook';
import Button from '../src/Button';
import Dropdown from '../src/Dropdown';
import {Menu, MenuItem} from '../src/Menu';
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
    () => (
      <Dropdown onSelect={action('select')}>
        <Button variant="cta">Test</Button>
        <Menu>
          <MenuItem value="foo">Foo</MenuItem>
          <MenuItem value="bar" selected>Bar</MenuItem>
          <MenuItem value="baz">Baz</MenuItem>
        </Menu>
      </Dropdown>
    ),
    {inline: true}
  );
