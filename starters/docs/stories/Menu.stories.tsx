import {MenuButton, MenuItem} from '../src/Menu';
import {Menu} from 'react-aria-components';

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
  <MenuButton label="Edit" {...args}>
    <MenuItem>Cut</MenuItem>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Paste</MenuItem>
  </MenuButton>
);
