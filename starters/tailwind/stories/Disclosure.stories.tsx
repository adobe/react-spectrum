import type { Meta } from "@storybook/react";
import React from "react";
import {
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureGroup,
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

export const Group = (args: any) => (
  <DisclosureGroup {...args}>
    <Disclosure>
      <DisclosureHeader>Files</DisclosureHeader>
      <DisclosurePanel>Files content</DisclosurePanel>
    </Disclosure>
    <Disclosure>
      <DisclosureHeader>Images</DisclosureHeader>
      <DisclosurePanel>Images content</DisclosurePanel>
    </Disclosure>
    <Disclosure>
      <DisclosureHeader>Documents</DisclosureHeader>
      <DisclosurePanel>Documents content</DisclosurePanel>
    </Disclosure>
  </DisclosureGroup>
);
