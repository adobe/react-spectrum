import {Autocomplete} from '../src/Autocomplete';
import {MenuItem} from '../src/Menu';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Autocomplete> = {
  component: Autocomplete,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Autocomplete>;

export const Example: Story = (args) => (
  <Autocomplete {...args}>
    <MenuItem>Create new file...</MenuItem>
    <MenuItem>Create new folder...</MenuItem>
    <MenuItem>Assign to...</MenuItem>
    <MenuItem>Assign to me</MenuItem>
    <MenuItem>Change status...</MenuItem>
    <MenuItem>Change priority...</MenuItem>
    <MenuItem>Add label...</MenuItem>
    <MenuItem>Remove label...</MenuItem>
  </Autocomplete>
);

Example.args = {
  label: 'Commands',
  placeholder: 'Search commands...'
};
