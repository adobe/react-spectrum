/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, Avatar, NotificationBadge, Provider, Text} from '../src';
import BellIcon from '../s2wf-icons/S2_Icon_Bell_20_N.svg';
import {categorizeArgTypes, getActionArgs, StaticColorDecorator} from './utils';
import CommentIcon from '../s2wf-icons/S2_Icon_Comment_20_N.svg';
import type {Meta, StoryObj} from '@storybook/react';
import NewIcon from '../s2wf-icons/S2_Icon_New_20_N.svg';
import {style} from '../style' with { type: 'macro' };
import './unsafe.css';
import {useNumberFormatter} from 'react-aria';

const events = ['onPress', 'onPressChange', 'onPressEnd', 'onPressStart', 'onPressUp'];

const meta: Meta<typeof ActionButton> = {
  component: ActionButton,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  argTypes: {
    ...categorizeArgTypes('Events', events),
    children: {table: {disable: true}}
  },
  args: {...getActionArgs(events)},
  title: 'ActionButton'
};

export default meta;

type Story = StoryObj<typeof ActionButton>;
export const Example: Story = {
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 8, padding: 8, justifyContent: 'center', overflow: 'auto'}}>
        <ActionButton aria-label="Press me" {...args}><NewIcon /></ActionButton>
        <ActionButton {...args}>Press me</ActionButton>
        <ActionButton {...args}><NewIcon /><Text>Press me</Text></ActionButton>
        <ActionButton {...args}><Text>Press me</Text><NewIcon /></ActionButton>
      </div>
    );
  }
};

export const ResizingExample: Story = {
  render: (args) => {
    return (
      <div className={style({display: 'flex', gap: 8, justifyContent: 'center', resize: 'horizontal', overflow: 'auto'})}>
        <ActionButton aria-label="Press me" {...args}><NewIcon /></ActionButton>
        <ActionButton {...args}>Press me</ActionButton>
        <ActionButton {...args}><NewIcon /><Text>Press me</Text></ActionButton>
        <ActionButton {...args}><Text>Press me</Text><NewIcon /></ActionButton>
      </div>
    );
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

const messages = {
  'ar-AR': {
    'button': 'يحرر',
    'copy': 'ينسخ',
    'cut': 'يقطع',
    'paste': 'معجون'
  },
  'en-US': {
    'button': 'Edit',
    'copy': 'Copy',
    'cut': 'Cut',
    'paste': 'Paste'
  },
  'he-IL': {
    'button': 'לַעֲרוֹך',
    'copy': 'עותק',
    'cut': 'גזירה',
    'paste': 'לְהַדבִּיק'
  },
  'ja-JP': {
    'button': '編集',
    'copy': 'コピー',
    'cut': '切る',
    'paste': 'ペースト'
  },
  'ko-KR': {
    'button': '편집하다',
    'copy': '복사',
    'cut': '자르다',
    'paste': '반죽'
  },
  'zh-CN': {
    'button': '编辑',
    'copy': '复制',
    'cut': '切',
    'paste': '粘贴'
  },
  'zh-TW': {
    'button': '編輯',
    'copy': '複製',
    'cut': '切',
    'paste': '粘貼'
  }
};

export const Fonts: Story = {
  render(args) {
    return (
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, auto)', alignItems: 'center', justifyItems: 'start', gap: 8}}>
        English (adobe-clean-vf)
        <Provider locale="en-US" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['en-US'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['en-US'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['en-US'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['en-US'].paste}</Text></ActionButton>
        </Provider>
        Arabic (adobe-clean-arabic)
        <Provider locale="ar-AR" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['ar-AR'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ar-AR'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ar-AR'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ar-AR'].paste}</Text></ActionButton>
        </Provider>
        Hebrew (adobe-clean-hebrew)
        <Provider locale="he-IL" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['he-IL'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['he-IL'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['he-IL'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['he-IL'].paste}</Text></ActionButton>
        </Provider>
        Japanese (adobe-clean-han-japanese)
        <Provider locale="ja-JP" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['ja-JP'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ja-JP'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ja-JP'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ja-JP'].paste}</Text></ActionButton>
        </Provider>
        Korean (adobe-clean-han-korean)
        <Provider locale="ko-KR" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['ko-KR'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ko-KR'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ko-KR'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['ko-KR'].paste}</Text></ActionButton>
        </Provider>
        Simplified Chinese (adobe-clean-han-simplified-c)
        <Provider locale="zh-Hans" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-CN'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-CN'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-CN'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-CN'].paste}</Text></ActionButton>
        </Provider>
        Traditional Chinese (adobe-clean-han-traditional)
        <Provider locale="zh-Hant" styles={style({display: 'contents'})}>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-TW'].button}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-TW'].copy}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-TW'].cut}</Text></ActionButton>
          <ActionButton {...args}><NewIcon /><Text>{messages['zh-TW'].paste}</Text></ActionButton>
        </Provider>
      </div>
    );
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const UnsafeClassName: Story = {
  render: (args) => {
    return (
      <div className={style({display: 'flex', gap: 8, justifyContent: 'center', overflow: 'auto'})}>
        <ActionButton {...args} UNSAFE_className="unsafe2">UNSAFE_className works</ActionButton>
      </div>
    );
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const Avatars: Story = {
  render: (args) => {
    return (
      <div style={{display: 'flex', gap: 8, padding: 8, justifyContent: 'center', overflow: 'auto'}}>
        <ActionButton aria-label="Press me" {...args}><Avatar src="https://i.imgur.com/xIe7Wlb.png" /></ActionButton>
        <ActionButton {...args}><Avatar src="https://i.imgur.com/xIe7Wlb.png" /><Text>Press me</Text></ActionButton>
        <ActionButton {...args}><Text>Press me</Text><Avatar src="https://i.imgur.com/xIe7Wlb.png" /></ActionButton>
      </div>
    );
  }
};

const NotificationBadgesExample = (args) => {
  let badgeValue = 10;
  let formattedValue = useNumberFormatter().format(badgeValue);
  return (
    <div style={{display: 'flex', gap: 8, padding: 8, justifyContent: 'center'}}>
      <ActionButton aria-label="Messages has new activity" {...args}><CommentIcon /><NotificationBadge /></ActionButton>
      <ActionButton aria-label={`${formattedValue} notifications`} {...args}><BellIcon /><NotificationBadge value={badgeValue} /></ActionButton>
      <ActionButton {...args}><CommentIcon /><Text>Messages</Text><NotificationBadge value={5} /></ActionButton>
      {!args.isQuiet && <ActionButton {...args}><Text>Notifications</Text><NotificationBadge value={105} /></ActionButton>}
    </div>
  );
};

export const NotificationBadges: Story = {
  render: NotificationBadgesExample
};

NotificationBadges.parameters = {
  docs: {
    source: {
      transform: () => {
        return `
let badgeValue = 10;
let formattedValue = useNumberFormatter().format(badgeValue);

return (
  <div style={{display: 'flex', gap: 8, padding: 8, justifyContent: 'center'}}>
    <ActionButton aria-label="Messages has new activity"><CommentIcon /><NotificationBadge /></ActionButton>
    <ActionButton aria-label={\`\${formattedValue} notifications\`} ><BellIcon /><NotificationBadge value={badgeValue} /></ActionButton>
    <ActionButton><CommentIcon /><Text>Messages</Text><NotificationBadge value={5} /></ActionButton>
    {/* Cannot have an label-only quiet Action Button with a Notification Badge */}
    {!isQuiet && <ActionButton><Text>Notifications</Text><NotificationBadge value={105} /></ActionButton>}
  </div>
        )`;
      }
    }
  }
};
