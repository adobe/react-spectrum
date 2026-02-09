import {ColorArea} from '../src/ColorArea';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ColorArea> = {
  component: ColorArea,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ColorArea>;

export const Example: Story = (args) => <ColorArea {...args} style={{width: 200}} />;

Example.args = {
  defaultValue: 'hsl(30, 100%, 50%)'
};
