import {NumberField} from '../src/NumberField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof NumberField> = {
  component: NumberField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <NumberField {...args} />;

Example.args = {
  label: 'Cookies'
};
