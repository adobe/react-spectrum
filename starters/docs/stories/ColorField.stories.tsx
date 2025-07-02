import {ColorField} from '../src/ColorField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof ColorField> = {
  component: ColorField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <ColorField {...args} />;

Example.args = {
  label: 'Color'
};
