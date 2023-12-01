import {MenuButton, MenuItem} from '../src/Menu';
import {Menu} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Menu> = {
  component: Menu,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => (
  <MenuButton label="Edit" {...args}>
    <MenuItem>Cut</MenuItem>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Paste</MenuItem>
  </MenuButton>
);
