import {ToggleButton} from '../src/ToggleButton';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof ToggleButton>;

export const Example: Story = (args) => <ToggleButton {...args}>Pin</ToggleButton>;
