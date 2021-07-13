import {action} from '@storybook/addon-actions';
import {ActionMenu} from '../src/ActionMenu';
import {Item} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('ActionMenu', module)
  .add('default menu (static)', () => (
    <ActionMenu onAction={action('action')}>
      <Item key="one">One</Item>
      <Item key="two">Two</Item>
      <Item key="three">Three</Item>
    </ActionMenu>
      ));
