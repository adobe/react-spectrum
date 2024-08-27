import type { Meta } from '@storybook/react';
import React from 'react';
import { Switch } from '../src/Switch';

const meta: Meta<typeof Switch> = {
  component: Switch,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <Switch {...args}>Wi-Fi</Switch>;
