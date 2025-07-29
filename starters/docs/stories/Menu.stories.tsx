import {Menu, MenuButton, MenuItem, SubmenuTrigger} from '../src/Menu';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof MenuButton> = {
  component: MenuButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof MenuButton>;

export const Example: Story = (args) => (
  <MenuButton label="Edit" {...args}>
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
  </MenuButton>
);

Example.args = {};
