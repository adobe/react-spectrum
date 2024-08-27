import type { Meta } from '@storybook/react';
import React from 'react';
import { Slider } from '../src/Slider';

const meta: Meta<typeof Slider> = {
  component: Slider,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <Slider {...args} />;

Example.args = {
  label: 'Range',
  defaultValue: [30, 60],
  thumbLabels: ['start', 'end']
};
