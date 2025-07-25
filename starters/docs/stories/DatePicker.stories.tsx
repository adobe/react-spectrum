import {DatePicker} from '../src/DatePicker';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof DatePicker>;

export const Example: Story = (args) => <DatePicker {...args} />;

Example.args = {
  label: 'Event date'
};
