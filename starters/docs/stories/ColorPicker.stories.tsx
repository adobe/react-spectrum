import {ColorPicker} from '../src/ColorPicker';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ColorPicker> = {
  component: ColorPicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof ColorPicker>;

export const Example: Story = (args) => <ColorPicker {...args} />;

Example.args = {
  label: 'Fill color',
  defaultValue: '#f00'
};
