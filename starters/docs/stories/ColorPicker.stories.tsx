import {ColorPicker} from '../src/ColorPicker';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof ColorPicker> = {
  component: ColorPicker,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <ColorPicker {...args} />;

Example.args = {
  label: 'Fill color',
  defaultValue: '#f00'
};
