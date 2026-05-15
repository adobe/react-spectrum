/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {MessageSource} from '../src/MessageSource';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import React from 'react';
import {style} from '../style' with {type: 'macro'};
import {DisclosurePanel} from '../src/Disclosure';


const meta: Meta<typeof MessageSource> = {
  component: MessageSource,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['S', 'M', 'L', 'XL']
    },
    density: {
      control: 'radio',
      options: ['compact', 'regular', 'spacious']
    },
    isDisabled: {
      control: {type: 'boolean'}
    },
    children: {table: {disable: true}}
  },
  title: 'MessageSource'
};

export default meta;
type Story = StoryObj<typeof MessageSource>;

export const Example: Story = {
  render: args => {
    return (
      <div className={style({minHeight: 240})}>
        <MessageSource label="File" {...args}>
          <DisclosurePanel>Files content</DisclosurePanel>
        </MessageSource>
      </div>
    );
  }
};
