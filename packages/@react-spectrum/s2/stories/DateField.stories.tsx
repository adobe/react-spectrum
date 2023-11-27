import {DateField} from '../src/DateField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof DateField> = {
  component: DateField,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => <DateField {...args} />;

Example.args = {
  label: 'Event date'
};
