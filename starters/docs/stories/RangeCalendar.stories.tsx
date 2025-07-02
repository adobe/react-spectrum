import {RangeCalendar} from '../src/RangeCalendar';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof RangeCalendar> = {
  component: RangeCalendar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

type Story = StoryFn<typeof RangeCalendar>;

export const Example: Story = (args) => (
  <RangeCalendar aria-label="Trip dates" {...args} />
);
