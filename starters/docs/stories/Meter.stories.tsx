import {Meter} from '../src/Meter';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Meter> = {
  component: Meter,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Meter>;

export const Example: Story = (args) => <Meter {...args} />;

Example.args = {
  label: 'Storage space',
  value: 80
};
