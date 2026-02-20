import {Checkbox} from '../src/Checkbox';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Checkbox>;

export const Example: Story = (args) => <Checkbox {...args}>Unsubscribe
</Checkbox>;
