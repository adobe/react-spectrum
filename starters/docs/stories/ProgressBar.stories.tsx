import {ProgressBar} from '../src/ProgressBar';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ProgressBar>;

export const Example: Story = (args) => <ProgressBar {...args} />;

Example.args = {
  label: 'Loading…',
  value: 80
};
