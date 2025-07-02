import {DisclosureGroup} from '../src/DisclosureGroup';
import {
  Button,
  Disclosure,
  DisclosurePanel,
  Heading
} from 'react-aria-components';

import type {Meta} from '@storybook/react';

const meta: Meta<typeof DisclosureGroup> = {
  component: DisclosureGroup,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <DisclosureGroup {...args}>
    <Disclosure id="personal">
      <Heading>
        <Button slot="trigger">
          <svg viewBox="0 0 24 24">
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          Personal Information
        </Button>
      </Heading>
      <DisclosurePanel>
        <p>Personal information form here.</p>
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id="billing">
      <Heading>
        <Button slot="trigger">
          <svg viewBox="0 0 24 24">
            <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          Billing Address
        </Button>
      </Heading>
      <DisclosurePanel>
        <p>Billing address form here.</p>
      </DisclosurePanel>
    </Disclosure>
  </DisclosureGroup>
);

Example.args = {
  defaultExpandedKeys: ['personal']
};
