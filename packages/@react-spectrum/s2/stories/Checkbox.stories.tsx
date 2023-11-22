import {Checkbox} from '../src/Checkbox';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => <Checkbox {...args}>Unsubscribe
</Checkbox>;
