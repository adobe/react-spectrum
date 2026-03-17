import {DateField} from '../src/DateField';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof DateField> = {
  component: DateField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof DateField>;

export const Example: Story = (args) => <DateField {...args} />;

Example.args = {
  label: 'Event date'
};
