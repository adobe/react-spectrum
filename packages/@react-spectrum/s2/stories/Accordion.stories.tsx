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

import {Accordion, Disclosure, DisclosureHeader, DisclosurePanel, TextField} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Accordion'
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Example: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Accordion {...args}>
          <Disclosure id="files">
            <DisclosureHeader>
              Files
            </DisclosureHeader>
            <DisclosurePanel>
              Files content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure id="people">
            <DisclosureHeader>
              People
            </DisclosureHeader>
            <DisclosurePanel>
              <TextField label="Name" styles={style({maxWidth: 176})} />
            </DisclosurePanel>
          </Disclosure>
        </Accordion>
      </div>
    );
  }
};

export const WithLongTitle: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 224})}>
        <Accordion styles={style({maxWidth: 224})} {...args}>
          <Disclosure>
            <DisclosureHeader>
              Files
            </DisclosureHeader>
            <DisclosurePanel>
              Files content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure>
            <DisclosureHeader>
              People
            </DisclosureHeader>
            <DisclosurePanel>
              People content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure>
            <DisclosureHeader>
              Very very very very very long title that wraps
            </DisclosureHeader>
            <DisclosurePanel>
              Accordion content
            </DisclosurePanel>
          </Disclosure>
        </Accordion>
      </div>
    );
  }
};

export const WithDisabledDisclosure: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Accordion {...args}>
          <Disclosure>
            <DisclosureHeader>
              Files
            </DisclosureHeader>
            <DisclosurePanel>
              Files content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure isDisabled>
            <DisclosureHeader>
              People
            </DisclosureHeader>
            <DisclosurePanel>
              <TextField label="Name" />
            </DisclosurePanel>
          </Disclosure>
        </Accordion>
      </div>
    );
  }
};

WithLongTitle.parameters = {
  docs: {
    disable: true
  }
};

WithDisabledDisclosure.parameters = {
  docs: {
    disable: true
  }
};

