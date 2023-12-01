import { MenuTrigger } from 'react-aria-components';
import {Menu, MenuItem, MenuSeparator} from '../src/Menu';

import type {Meta} from '@storybook/react';
import { Button } from '../src/Button';
import { MoreHorizontal } from 'lucide-react';

const meta: Meta<typeof Menu> = {
  component: Menu,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <MenuTrigger>
    <Button variant="secondary" className="px-2"><MoreHorizontal className="w-5 h-5" /></Button>
    <Menu {...args}>
      <MenuItem id="new">New…</MenuItem>
      <MenuItem id="open">Open…</MenuItem>
      <MenuSeparator />
      <MenuItem id="save">Save</MenuItem>
      <MenuItem id="saveAs">Save as…</MenuItem>
      <MenuSeparator />
      <MenuItem id="print">Print…</MenuItem>
    </Menu>
  </MenuTrigger>
);

export const DisabledItems = (args: any) => <Example {...args} />;
DisabledItems.args = {
  disabledKeys: ['save']
};
