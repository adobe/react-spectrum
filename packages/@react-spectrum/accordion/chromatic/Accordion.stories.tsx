/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Accordion, Disclosure, DisclosurePanel, DisclosureTitle, SpectrumAccordionProps} from '../';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';

const meta: Meta = {
  title: 'Accordion',
  component: Disclosure,
  excludeStories: ['Template']
};

export default meta;

export type AccordionStory = StoryObj<SpectrumAccordionProps>;

export const Template = (args: SpectrumAccordionProps): JSX.Element => (
  <Accordion {...args}>
    <Disclosure id="files">
      <DisclosureTitle>
        Your files
      </DisclosureTitle>
      <DisclosurePanel>
        files
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id="shared">
      <DisclosureTitle>
        Shared with you
      </DisclosureTitle>
      <DisclosurePanel>
        shared
      </DisclosurePanel>
    </Disclosure>
    <Disclosure id="last">
      <DisclosureTitle>
        Last item
      </DisclosureTitle>
      <DisclosurePanel>
        last
      </DisclosurePanel>
    </Disclosure>
  </Accordion>
);

export const Default: AccordionStory = {
  render: (args) => <Template {...args} />
};

export const WithExpandedKeys: AccordionStory = {
  render: (args) => <Template {...args} />,
  args: {defaultExpandedKeys: ['shared']}
};

export const WithDisabledDisclosure: AccordionStory = {
  render: (args) => (
    <Accordion {...args}>
      <Disclosure id="files">
        <DisclosureTitle>
          Your files
        </DisclosureTitle>
        <DisclosurePanel>
          files
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="shared">
        <DisclosureTitle>
          Shared with you
        </DisclosureTitle>
        <DisclosurePanel>
          shared
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="last" isDisabled>
        <DisclosureTitle>
          Last item
        </DisclosureTitle>
        <DisclosurePanel>
          last
        </DisclosurePanel>
      </Disclosure>
    </Accordion>)
};

export const Disabled: AccordionStory = {
  render: (args) => <Template {...args} />,
  args: {isDisabled: true}
};

export const Quiet: AccordionStory = {
  render: (args) => <Template {...args} />,
  args: {isQuiet: true}
};

export const WithWrappingTitle: AccordionStory = {
  render: (args) => (
    <Accordion maxWidth="size-3000" {...args}>
      <Disclosure id="files">
        <DisclosureTitle>
          Long long long long long long long long long long long long long  long long long wrapping title
        </DisclosureTitle>
        <DisclosurePanel>
          Files content
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="people">
        <DisclosureTitle>
          People
        </DisclosureTitle>
        <DisclosurePanel>
          People content
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  )
};
