import {Button} from '../src/Button';
import {CommandPalette} from '../src/CommandPalette';
import {DialogTrigger} from '../src/Dialog';
import {MenuItem} from '../src/Menu';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof CommandPalette> = {
  component: CommandPalette,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof CommandPalette>;

export const Example: Story = (args) => (
  <DialogTrigger>
    <Button>Open Command Palette <kbd>⌘ J</kbd></Button>
    <CommandPalette {...args}>
      <MenuItem>Create new file...</MenuItem>
      <MenuItem>Create new folder...</MenuItem>
      <MenuItem>Assign to...</MenuItem>
      <MenuItem>Assign to me</MenuItem>
      <MenuItem>Change status...</MenuItem>
      <MenuItem>Change priority...</MenuItem>
      <MenuItem>Add label...</MenuItem>
      <MenuItem>Remove label...</MenuItem>
    </CommandPalette>
  </DialogTrigger>
);
