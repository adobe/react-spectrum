import {Disclosure, DisclosureHeader, DisclosurePanel} from '../src/Disclosure';

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
  <Disclosure {...args}>
    <DisclosureHeader>Manage your account</DisclosureHeader>
    <DisclosurePanel>Details on managing your account</DisclosurePanel>
  </Disclosure>
);

