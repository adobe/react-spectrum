import {Menu, MenuTrigger, MenuItem, SubmenuTrigger} from '../src/Menu';
import {Button} from '../src/Button';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Menu> = {
  component: Menu,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Menu>;

export const Example: Story = (args) => (
  <MenuTrigger>
    <Button>Edit</Button>
    <Menu {...args}>
      <MenuItem>Favorite</MenuItem>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Delete</MenuItem>
      <SubmenuTrigger>
        <MenuItem>Share</MenuItem>
        <Menu>
          <MenuItem>SMS</MenuItem>
          <MenuItem>Email</MenuItem>
        </Menu>
      </SubmenuTrigger>
    </Menu>
  </MenuTrigger>
);

Example.args = {};
