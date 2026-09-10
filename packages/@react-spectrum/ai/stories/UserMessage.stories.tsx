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

import {ActionMenu} from '@react-spectrum/s2/ActionMenu';
import {categorizeArgTypes} from '../../s2/stories/utils';
import {Heading} from '@react-spectrum/s2/Heading';
import {Image} from '@react-spectrum/s2/Image';
import {MenuItem} from '@react-spectrum/s2/Menu';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Text} from '@react-spectrum/s2/Text';
import {UserMessage} from '@react-spectrum/ai';

const events: string[] = [];

const meta: Meta<typeof UserMessage> = {
  component: UserMessage,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  },
  tags: ['autodocs'],
  title: 'AI/UserMessage'
};

export default meta;
type Story = StoryObj<typeof UserMessage>;

export const Example: Story = {
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end'}}>
      <UserMessage {...args}>Can you summarize this report?</UserMessage>
      <UserMessage {...args}>
        Can you help me create a 45-minute presentation, with animations, for an executive update?
      </UserMessage>
    </div>
  )
};

export const WithImage: Story = {
  render: args => (
    <div style={{width: 250}}>
      <UserMessage {...args}>
        <Image
          slot="image"
          src={new URL('../../s2/stories/assets/preview.png', import.meta.url).toString()}
          alt="Hotel commercial assets"
        />
        <div
          className={style({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 8
          })}>
          <Heading
            styles={style({
              font: 'title-xs',
              margin: 0,
              flexGrow: 1,
              minWidth: 0
            })}>
            Hotel commercial assets
          </Heading>
          <ActionMenu isQuiet size="XS">
            <MenuItem>Edit</MenuItem>
            <MenuItem>Share</MenuItem>
            <MenuItem>Delete</MenuItem>
          </ActionMenu>
        </div>
        <Text styles={style({font: 'body-2xs'})}>2026</Text>
      </UserMessage>
    </div>
  )
};

export const WithCard: Story = {
  render: args => (
    <div style={{width: 300}}>
      <UserMessage {...args}>
        <Image
          src={new URL('../../s2/stories/assets/preview.png', import.meta.url).toString()}
          alt="Hotel commercial assets"
          styles={style({
            width: 32,
            height: 32,
            borderRadius: 'sm',
            backgroundColor: 'transparent',
            flexShrink: 0
          })}
        />
        <div
          className={style({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexGrow: 1,
            gap: 8,
            minWidth: 0
          })}>
          <div
            className={style({
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0
            })}>
            <Heading styles={style({font: 'title-xs', margin: 0})}>Hotel commercial assets</Heading>
            <Text styles={style({font: 'body-2xs'})}>2026</Text>
          </div>
          <ActionMenu isQuiet size="S">
            <MenuItem>Edit</MenuItem>
            <MenuItem>Share</MenuItem>
            <MenuItem>Delete</MenuItem>
          </ActionMenu>
        </div>
      </UserMessage>
    </div>
  )
};
