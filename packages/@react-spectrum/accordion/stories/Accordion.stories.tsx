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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import React from 'react';

export default {
  title: 'Accordion',
  component: AccordionGroup,
  argTypes: {}
} as ComponentMeta<typeof AccordionGroup>;

export type AccordionStory = ComponentStoryObj<typeof AccordionGroup>;

export const Default: AccordionStory = {
  render: (args) => (
    <AccordionGroup {...args}>
      <AccordionItem key="files">
        <AccordionHeader>
          Files
        </AccordionHeader>
        <AccordionPanel>
          <p>Files content</p>
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem key="people">
        <AccordionHeader>
          People
        </AccordionHeader>
        <AccordionPanel>
          <p>People content</p>
        </AccordionPanel>
      </AccordionItem>
    </AccordionGroup>
  )
};
