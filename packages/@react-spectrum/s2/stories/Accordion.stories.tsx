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

import {AccordionGroup, AccordionHeader, AccordionItem, AccordionPanel} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };

const meta: Meta<typeof AccordionGroup> = {
  component: AccordionGroup,
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
    }
  }
};

export default meta;
type Story = StoryObj<typeof AccordionGroup>;

export const Example: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 224})}>
        <AccordionGroup styles={style({width: 384})}  {...args}>
          <AccordionItem key="files">
            <AccordionHeader>
              Files
            </AccordionHeader>
            <AccordionPanel>
              Files content
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem key="people">
            <AccordionHeader>
              People
            </AccordionHeader>
            <AccordionPanel>
              People content
            </AccordionPanel>
          </AccordionItem>
        </AccordionGroup>
      </div>
    );
  }
};

export const WithLongTitle: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 224})}>
        <AccordionGroup styles={style({maxWidth: 224})} {...args}>
          <AccordionItem key="files">
            <AccordionHeader>
              Files
            </AccordionHeader>
            <AccordionPanel>
              Files content
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem key="people">
            <AccordionHeader>
              People
            </AccordionHeader>
            <AccordionPanel>
              People content
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem key="long-title">
            <AccordionHeader>
              Very long title that wraps
            </AccordionHeader>
            <AccordionPanel>
              Accordion content
            </AccordionPanel>
          </AccordionItem>
        </AccordionGroup>
      </div>
    );
  }
};
