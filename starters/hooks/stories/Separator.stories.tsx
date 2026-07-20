import {Separator} from '../src/Separator';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Separator> = {
  component: Separator,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Separator>;

export const Example: Story = args => (
  <div style={{width: 200}}>
    <Separator {...args} />
  </div>
);
