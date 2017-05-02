import React from 'react';
import {storiesOf} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {List, ListItem, ListGroup} from '../src/List';

storiesOf('List', module)
  .addDecorator(story => (
    <VerticalCenter style={ {textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'} }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <List>
        <ListGroup label="Group 1">
          <ListItem selected>Foo</ListItem>
          <ListItem icon="twitter">Bar</ListItem>
          <ListItem disabled>Baz</ListItem>
        </ListGroup>
        <ListGroup label="Group 2">
          <ListItem>Test</ListItem>
          <ListItem>Hi</ListItem>
        </ListGroup>
      </List>
    ),
    {inline: true}
  );
