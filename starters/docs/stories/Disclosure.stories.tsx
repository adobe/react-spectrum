import {Disclosure} from '../src/Disclosure';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof Disclosure> = {
  component: Disclosure,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof Disclosure>;

export const Example: Story = (args) => (
  <Disclosure {...args}>Details on managing your account</Disclosure>
);

Example.args = {
  title: 'Manage your account'
};
