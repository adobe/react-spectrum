/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
// @ts-ignore
import intlMessages from './intlMessages.json';
import {Item, Menu, MenuTrigger, SpectrumMenuTriggerProps} from '../';
import {Keyboard, Text} from '@react-spectrum/text';
import {Meta, StoryFn} from '@storybook/react';
import Paste from '@spectrum-icons/workflow/Paste';
import {Provider} from '@react-spectrum/provider';
import React, {JSX} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export default {
  title: 'Languages/MenuTrigger',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['en-US'],
      scales: ['large']
    }
  },
  excludeStories: ['TranslateMenu']
} as Meta<typeof MenuTrigger>;

let iconMap = {
  Copy,
  Cut,
  Paste
};

let menuItems = [
  {name: 'copy', icon: 'Copy', shortcut: '⌘C'},
  {name: 'cut', icon: 'Cut', shortcut: '⌘X'},
  {name: 'paste', icon: 'Paste', shortcut: '⌘V'}
];

const customMenuItem = (item, strings) => {
  let Icon = iconMap[item.icon];
  return (
    <Item textValue={item.name} key={item.name}>
      <Icon size="S" />
      <Text>{strings.format(item.name)}</Text>
      <Keyboard>{item.shortcut}</Keyboard>
    </Item>
  );
};

export let TranslateMenu = (props: Omit<SpectrumMenuTriggerProps, 'children'>): JSX.Element => {
  let strings = useLocalizedStringFormatter(intlMessages);

  return (
    <MenuTrigger {...props}>
      <ActionButton>
        {strings.format('button')}
      </ActionButton>
      <Menu items={menuItems}>
        {item => customMenuItem(item, strings)}
      </Menu>
    </MenuTrigger>
  );
};

export type MenuTriggerLanguagesStory = StoryFn<typeof MenuTrigger>;

export const ArabicComplex: MenuTriggerLanguagesStory = () => (
  <Provider locale="ar-AE">
    <TranslateMenu isOpen />
  </Provider>
);

export const HebrewComplex: MenuTriggerLanguagesStory = () => (
  <Provider locale="he-IL">
    <TranslateMenu isOpen />
  </Provider>
);

export const JapaneseComplex: MenuTriggerLanguagesStory = () => (
  <Provider locale="ja-JP">
    <TranslateMenu isOpen />
  </Provider>
);

export const KoreanComplex: MenuTriggerLanguagesStory = () => (
  <Provider locale="ko-KR">
    <TranslateMenu isOpen />
  </Provider>
);

export const ChineseSimplfiedComplex: MenuTriggerLanguagesStory = () => (
  <Provider locale="zh-CN">
    <TranslateMenu isOpen />
  </Provider>
);

export const ChineseTraditionalComplex: MenuTriggerLanguagesStory = () => (
  <Provider locale="zh-TW">
    <TranslateMenu isOpen />
  </Provider>
);
