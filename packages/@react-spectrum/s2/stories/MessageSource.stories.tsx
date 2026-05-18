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

import {MessageSource, SourceList, SourceListItem} from '../src/MessageSource';
import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {style} from '../style' with {type: 'macro'};

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
  args: {
    label: 'Sources'
  },
  render: args => {
    return (
      <div className={style({minHeight: 240})}>
        <MessageSource {...args}>
          <SourceList>
            <SourceListItem href="#">Hilton email</SourceListItem>
            <SourceListItem href="#">Market research</SourceListItem>
            <SourceListItem href="#">User research</SourceListItem>
          </SourceList>
        </MessageSource>
      </div>
    );
  }
};

export const Dynamic: Story = {
  args: {
    label: 'Sources'
  },
  render: args => {
    const sources = [
      {id: '1', label: 'Hilton email', href: '#'},
      {id: '2', label: 'Market research', href: '#'},
      {id: '3', label: 'User research', href: '#'}
    ];
    return (
      <div className={style({minHeight: 240})}>
        <MessageSource {...args}>
          <SourceList>
            {sources.map(source => (
              <SourceListItem key={source.id} href={source.href}>
                {source.label}
              </SourceListItem>
            ))}
          </SourceList>
        </MessageSource>
      </div>
    );
  }
};
