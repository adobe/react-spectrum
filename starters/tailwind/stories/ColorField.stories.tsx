import type { Meta } from '@storybook/react';
import React from 'react';
import { ColorField } from '../src/ColorField';

const meta: Meta<typeof ColorField> = {
  component: ColorField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    label: 'Color',
    defaultValue: '#ff0'
  }
};

export default meta;

export const Example = (args: any) => <ColorField {...args} />;
