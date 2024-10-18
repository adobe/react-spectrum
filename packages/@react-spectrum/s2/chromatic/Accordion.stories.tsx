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

import {Accordion, ActionButton, Disclosure, DisclosureHeader, DisclosurePanel, DisclosureTitle, TextField} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import React from 'react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  parameters: {
    chromaticProvider: {disableAnimations: true}
  },
  title: 'S2 Chromatic/Accordion'
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Example: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Accordion {...args}>
          <Disclosure id="files">
            <DisclosureTitle>
              Files
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
            <DisclosureTitle>
              Files
            </DisclosureTitle>
            <DisclosurePanel>
              Files content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure>
            <DisclosureTitle>
              People
            </DisclosureTitle>
            <DisclosurePanel>
              People content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure>
            <DisclosureTitle>
              Very very very very very long title that wraps
            </DisclosureTitle>
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
            <DisclosureTitle>
              Files
            </DisclosureTitle>
            <DisclosurePanel>
              Files content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure isDisabled>
            <DisclosureTitle>
              People
            </DisclosureTitle>
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

export const WithActionButton: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Accordion {...args}>
          <Disclosure id="files">
            <DisclosureHeader>
              <DisclosureTitle>
                Files
              </DisclosureTitle>
              <ActionButton><NewIcon aria-label="new icon" /></ActionButton>
            </DisclosureHeader>
            <DisclosurePanel>
              Files content
            </DisclosurePanel>
          </Disclosure>
          <Disclosure id="people">
            <DisclosureHeader>
              <DisclosureTitle>
                People
              </DisclosureTitle>
              <ActionButton><NewIcon aria-label="new icon" /></ActionButton>
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
