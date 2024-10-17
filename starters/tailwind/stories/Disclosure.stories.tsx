import type { Meta } from "@storybook/react";
import React from "react";
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
} from "../src/Disclosure";

const meta: Meta<typeof Disclosure> = {
  component: Disclosure,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => (
  <Disclosure {...args}>
    <DisclosureHeader>Files</DisclosureHeader>
    <DisclosurePanel>Files content</DisclosurePanel>
  </Disclosure>
);
