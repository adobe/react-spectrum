import {DisclosureGroup} from '../src/DisclosureGroup';
import {Disclosure} from '../src/Disclosure';

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
    <Disclosure id="personal" title="Personal Information">
      <p>Personal information form here.</p>
    </Disclosure>
    <Disclosure id="billing" title="Billing Address">
      <p>Billing address form here.</p>
    </Disclosure>
  </DisclosureGroup>
);

Example.args = {
  defaultExpandedKeys: ['personal']
};
