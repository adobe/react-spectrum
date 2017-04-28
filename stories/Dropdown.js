import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import Button from '../src/Button';
import Dropdown from '../src/Dropdown';
import {Menu, MenuItem} from '../src/Menu';

storiesOf('Dropdown', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Dropdown>
        <Button variant="cta">Test</Button>
        <Menu>
          <MenuItem>Foo</MenuItem>
          <MenuItem selected>Bar</MenuItem>
          <MenuItem>Baz</MenuItem>
        </Menu>
      </Dropdown>
    ),
    {inline: true}
  );
