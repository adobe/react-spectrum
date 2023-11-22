import {TimeField} from '../src/TimeField';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof TimeField> = {
  component: TimeField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <TimeField {...args} />;

Example.args = {
  label: 'Event time'
};
