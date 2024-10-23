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

import {Accordion, Disclosure, DisclosureHeader, DisclosurePanel, SpectrumAccordionProps} from '../src';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';

const meta: Meta<SpectrumAccordionProps> = {
  title: 'Accordion',
  component: Accordion,
  argTypes: {
    isDisabled: {
      control: 'boolean'
    },
    isQuiet: {
      control: 'boolean'
    }
  }
};

export default meta;
type AccordionStory = StoryObj<typeof Accordion>;

export const Default: AccordionStory = {
  render: (args) => (
    <Accordion {...args}>
      <Disclosure id="files">
        <DisclosureHeader>
          Files
        </DisclosureHeader>
        <DisclosurePanel>
          <p>Files content</p>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="people">
        <DisclosureHeader>
          People
        </DisclosureHeader>
        <DisclosurePanel>
          <p>People content</p>
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  )
};

export const WithExpandedKeys: AccordionStory = {
  ...Default,
  args: {defaultExpandedKeys: ['files']}
};

export const WithDisabledDisclosure: AccordionStory = {
  render: (args) => (
    <Accordion {...args}>
      <Disclosure id="files">
        <DisclosureHeader>
          Your files
        </DisclosureHeader>
        <DisclosurePanel>
          files
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="shared">
        <DisclosureHeader>
          Shared with you
        </DisclosureHeader>
        <DisclosurePanel>
          shared
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="last" isDisabled>
        <DisclosureHeader>
          Last item
        </DisclosureHeader>
        <DisclosurePanel>
          last
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  )
};
