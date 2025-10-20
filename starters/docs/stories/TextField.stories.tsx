import {TextField} from '../src/TextField';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof TextField> = {
  component: TextField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    placeholder: 'Enter your full name'
  }
};

export default meta;

type Story = StoryFn<typeof TextField>;

export const Example: Story = (args) => <TextField {...args} />;

Example.args = {
  label: 'Name'
};
