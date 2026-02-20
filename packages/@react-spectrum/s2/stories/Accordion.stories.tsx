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

import {Accordion, AccordionItem, AccordionItemHeader, AccordionItemPanel, AccordionItemTitle, ActionButton, TextField} from '../src';
import {Key} from 'react-aria';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import React from 'react';
import {style} from '../style' with { type: 'macro' };


const meta: Meta<typeof Accordion> = {
  component: Accordion,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    children: {table: {disable: true}}
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
          <AccordionItem id="files">
            <AccordionItemTitle>
              Files
            </AccordionItemTitle>
            <AccordionItemPanel>
              Files content
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem id="people">
            <AccordionItemTitle>
              People
            </AccordionItemTitle>
            <AccordionItemPanel>
              <TextField label="Name" styles={style({maxWidth: 176})} placeholder="Enter your name" />
            </AccordionItemPanel>
          </AccordionItem>
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
          <AccordionItem>
            <AccordionItemTitle>
              Files
            </AccordionItemTitle>
            <AccordionItemPanel>
              Files content
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemTitle>
              People
            </AccordionItemTitle>
            <AccordionItemPanel>
              People content
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionItemTitle>
              Very very very very very long title that wraps
            </AccordionItemTitle>
            <AccordionItemPanel>
              Accordion content
            </AccordionItemPanel>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
};

export const WithDisabledItem: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Accordion {...args}>
          <AccordionItem>
            <AccordionItemTitle>
              Files
            </AccordionItemTitle>
            <AccordionItemPanel>
              Files content
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem isDisabled>
            <AccordionItemTitle>
              People
            </AccordionItemTitle>
            <AccordionItemPanel>
              <TextField label="Name" placeholder="Enter your name" />
            </AccordionItemPanel>
          </AccordionItem>
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

WithDisabledItem.parameters = {
  docs: {
    disable: true
  }
};

function ControlledAccordion(props) {
  let [expandedKeys, setExpandedKeys] = React.useState<Set<Key>>(new Set(['people']));
  return (
    <div className={style({font: 'body', display: 'flex', flexDirection: 'column', gap: 8})}>
      <Accordion
        onExpandedChange={setExpandedKeys}
        expandedKeys={expandedKeys}
        {...props}>
        <AccordionItem id="files">
          <AccordionItemTitle>
            Files
          </AccordionItemTitle>
          <AccordionItemPanel>
            Files content
          </AccordionItemPanel>
        </AccordionItem>
        <AccordionItem id="people">
          <AccordionItemTitle>
            People
          </AccordionItemTitle>
          <AccordionItemPanel>
            <TextField label="Name" placeholder="Enter your name" />
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
      <div>Expanded keys: {expandedKeys.size ? Array.from(expandedKeys).join(', ') : 'none'}</div>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledAccordion />
};

Controlled.parameters = {
  docs: {
    disable: true
  }
};

export const ControlledOpen: Story = {
  render: (args) => {
    return (
      <Accordion
        {...args}
        expandedKeys={['people']}>
        <AccordionItem id="files">
          <AccordionItemTitle>
            Files
          </AccordionItemTitle>
          <AccordionItemPanel>
            Files content
          </AccordionItemPanel>
        </AccordionItem>
        <AccordionItem id="people">
          <AccordionItemTitle>
            People
          </AccordionItemTitle>
          <AccordionItemPanel>
            <TextField label="Name" placeholder="Enter your name" />
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    );
  }
};

ControlledOpen.parameters = {
  docs: {
    disable: true
  }
};

export const WithActionButton: Story = {
  render: (args) => {
    return (
      <div className={style({minHeight: 240})}>
        <Accordion {...args}>
          <AccordionItem id="files">
            <AccordionItemHeader>
              <AccordionItemTitle>
                Files
              </AccordionItemTitle>
              <ActionButton aria-label="Add new file"><NewIcon /></ActionButton>
            </AccordionItemHeader>
            <AccordionItemPanel>
              Files content
            </AccordionItemPanel>
          </AccordionItem>
          <AccordionItem id="people">
            <AccordionItemHeader>
              <AccordionItemTitle>
                People
              </AccordionItemTitle>
              <ActionButton aria-label="Add new person"><NewIcon /></ActionButton>
            </AccordionItemHeader>
            <AccordionItemPanel>
              <TextField label="Name" styles={style({maxWidth: 176})} placeholder="Enter your name" />
            </AccordionItemPanel>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
};
