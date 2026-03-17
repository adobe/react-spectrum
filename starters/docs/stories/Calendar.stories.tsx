import {Calendar} from '../src/Calendar';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Calendar>;

export const Example: Story = (args) => (
  <Calendar aria-label="Event date" {...args} />
);
