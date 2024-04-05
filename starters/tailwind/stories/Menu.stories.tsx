import type { Meta } from '@storybook/react';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';
import { MenuTrigger, Popover, SubmenuTrigger } from 'react-aria-components';
import { Button } from '../src/Button';
import { Menu, MenuItem, MenuSection, MenuSeparator } from '../src/Menu';

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
    <Button variant="secondary" className="px-2">
      <MoreHorizontal className="w-5 h-5" />
    </Button>
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

export const Sections = (args: any) => (
  <MenuTrigger>
    <Button variant="secondary" className="px-2">
      <MoreHorizontal className="w-5 h-5" />
    </Button>
    <Menu {...args}>
      <MenuSection title="Your Content">
        <MenuItem id="repos">Repositories</MenuItem>
        <MenuItem id="projects">Projects</MenuItem>
        <MenuItem id="organizations">Organizations</MenuItem>
        <MenuItem id="stars">Stars</MenuItem>
        <MenuItem id="sponsors">Sponsors</MenuItem>
      </MenuSection>
      <MenuSection title="Your Account">
        <MenuItem id="profile">Profile</MenuItem>
        <MenuItem id="status">Set status</MenuItem>
        <MenuItem id="sign-out">Sign out</MenuItem>
      </MenuSection>
    </Menu>
  </MenuTrigger>
);

export const Submenu = (args: any) => (
  <MenuTrigger>
    <Button variant="secondary" className="px-2">
      <MoreHorizontal className="w-5 h-5" />
    </Button>
    <Menu {...args}>
      <MenuItem id="new">New…</MenuItem>
      <SubmenuTrigger>
        <MenuItem id="open">Open</MenuItem>
        <Popover>
          <Menu>
            <MenuItem id="open-new">Open in New Window</MenuItem>
            <MenuItem id="open-current">Open in Current Window</MenuItem>
          </Menu>
        </Popover>
      </SubmenuTrigger>
      <MenuSeparator />
      <MenuItem id="print">Print…</MenuItem>
      <SubmenuTrigger>
        <MenuItem id="share">Share</MenuItem>
        <Popover>
          <Menu>
            <MenuItem id="sms">SMS</MenuItem>
            <MenuItem id="twitter">Twitter</MenuItem>
            <SubmenuTrigger>
              <MenuItem id="email">Email</MenuItem>
              <Popover>
                <Menu>
                  <MenuItem id="work">Work</MenuItem>
                  <MenuItem id="personal">Personal</MenuItem>
                </Menu>
              </Popover>
            </SubmenuTrigger>
          </Menu>
        </Popover>
      </SubmenuTrigger>
    </Menu>
  </MenuTrigger>
);
