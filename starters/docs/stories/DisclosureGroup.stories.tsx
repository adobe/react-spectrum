import {DisclosureGroup} from '../src/DisclosureGroup';
import {Disclosure, DisclosureHeader, DisclosurePanel} from '../src/Disclosure';

import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof DisclosureGroup> = {
  component: DisclosureGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryFn<typeof DisclosureGroup>;

export const Example: Story = (args) => (
  <DisclosureGroup {...args} style={{width: '400px'}}>
    <Disclosure id="personal">
      <DisclosureHeader>Personal Information</DisclosureHeader>
      <DisclosurePanel>
        <p>Personal information form here.</p>
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id="billing">
      <DisclosureHeader>Billing Address</DisclosureHeader>
      <DisclosurePanel>
        <p>Billing address form here.</p>
      </DisclosurePanel>
    </Disclosure>
  </DisclosureGroup>
);

Example.args = {
  defaultExpandedKeys: ['personal']
};
