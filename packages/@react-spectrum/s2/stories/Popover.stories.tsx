import {Popover} from '../src/Popover';
import {Button, DialogTrigger, Heading} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Popover> = {
  component: Popover,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <DialogTrigger>
    <Button aria-label="Help">ⓘ</Button>
    <Popover {...args}>
      <Heading slot="title">Help</Heading>
      <p>For help accessing your account, please contact support.</p>
    </Popover>
  </DialogTrigger>
);
