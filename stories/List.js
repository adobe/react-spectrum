import {List, ListItem} from '../src/List';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Twitter from '../src/Icon/Twitter';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('List', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <List>
        <ListItem selected>Foo</ListItem>
        <ListItem icon={<Twitter />}>Bar</ListItem>
        <ListItem disabled>Baz</ListItem>
        <ListItem>Test</ListItem>
        <ListItem>Hi</ListItem>
      </List>
    ),
    {inline: true}
  );
