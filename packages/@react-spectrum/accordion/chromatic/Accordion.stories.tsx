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

import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from '../';
import {Meta} from '@storybook/react';
import React from 'react';

const meta: Meta = {
  title: 'Accordion',
  component: AccordionItem,
  excludeStories: ['Template']
};

export default meta;

export const Template = (args) => (
  <Accordion {...args}>
    <AccordionItem key="files">
      <AccordionHeader>
        Your files
      </AccordionHeader>
      <AccordionPanel>
        files
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem key="shared">
      <AccordionHeader>
        Shared with you
      </AccordionHeader>
      <AccordionPanel>
        shared
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem key="last">
      <AccordionHeader>
        Last item
      </AccordionHeader>
      <AccordionPanel>
        last
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);

export const Default = {
  render: Template
};

// TODO: more stories
