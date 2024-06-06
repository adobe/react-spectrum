import {RangeSlider} from '../src';
import type {Meta} from '@storybook/react';

const meta: Meta<typeof RangeSlider> = {
  component: RangeSlider,
  parameters: {
    layout: 'centered',
    controls: {exclude: ['onChange']}
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <RangeSlider {...args} />;

Example.args = {
  label: 'Range',
  defaultValue: [30, 60],
  thumbLabels: ['start', 'end']
};
