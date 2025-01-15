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

import {ActionButton, Disclosure, DisclosureHeader, DisclosurePanel, DisclosureTitle} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import React from 'react';
import {style} from '../style' with { type: 'macro' };


const meta: Meta<typeof Disclosure> = {
  component: Disclosure,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['S', 'M', 'L', 'XL']
    },
    isQuiet: {
      control: {type: 'boolean'}
    },
    density: {
      control: 'radio',
      options: ['compact', 'regular', 'spacious']
    },
    isDisabled: {
      control: {type: 'boolean'}
    }
  },
  title: 'Disclosure'
};

export default meta;
type Story = StoryObj<typeof Disclosure>;

export const Example: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Disclosure {...args}>
          <DisclosureTitle>
            Files
          </DisclosureTitle>
          <DisclosurePanel>
            Files content
          </DisclosurePanel>
        </Disclosure>
      </div>
    );
  }
};

export const WithLongTitle: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Disclosure styles={style({maxWidth: 224})}  {...args}>
          <DisclosureTitle>
            Very very very very very long title that wraps
          </DisclosureTitle>
          <DisclosurePanel>
            Content
          </DisclosurePanel>
        </Disclosure>
      </div>
    );
  }
};


WithLongTitle.parameters = {
  docs: {
    disable: true
  }
};

export const Controlled: Story['render'] = (args) => {
  let [isExpanded, setExpanded] = React.useState(false);
  return (
    <Disclosure {...args} isExpanded={isExpanded} onExpandedChange={setExpanded}>
      <DisclosureTitle>
        Files
      </DisclosureTitle>
      <DisclosurePanel>
        Files content
      </DisclosurePanel>
    </Disclosure>
  );
};

export const ControlledClosed: Story = {
  render: (args) => (
    <Disclosure isExpanded={false} {...args}>
      <DisclosureTitle>
        Files
      </DisclosureTitle>
      <DisclosurePanel>
        Files content
      </DisclosurePanel>
    </Disclosure>
  )
};

ControlledClosed.parameters = {
  docs: {
    disable: true
  }
};

export const WithActionButton: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Disclosure {...args}>
          <DisclosureHeader>
            <DisclosureTitle>
              Files
            </DisclosureTitle>
            <ActionButton><NewIcon aria-label="new icon " /></ActionButton>
          </DisclosureHeader>
          <DisclosurePanel>
            Files content
          </DisclosurePanel>
        </Disclosure>
      </div>
    );
  }
};

