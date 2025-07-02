import {Disclosure} from '../src/Disclosure';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof Disclosure> = {
  component: Disclosure,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Disclosure {...args}>Details on managing your account</Disclosure>
);

Example.args = {
  title: 'Manage your account'
};
