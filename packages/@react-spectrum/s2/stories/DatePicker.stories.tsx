import {DatePicker} from '../src/DatePicker';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  parameters: {
    layout: 'centered'
  }
};

export default meta;

export const Example = (args: any) => <DatePicker {...args} />;

Example.args = {
  label: 'Event date'
};
