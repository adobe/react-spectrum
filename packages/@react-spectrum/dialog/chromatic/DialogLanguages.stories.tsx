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

import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import {Content, Header} from '@react-spectrum/view';
import {Dialog, DialogTrigger, SpectrumDialogTriggerProps} from '../';
import {Divider} from '@react-spectrum/divider';
import {Heading} from '@react-spectrum/text';
// @ts-ignore
import intlMessages from './intlMessages.json';
import {Item, TagGroup} from '@react-spectrum/tag';
import {Meta, StoryFn} from '@storybook/react';
import {Provider} from '@react-spectrum/provider';
import React, {JSX} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export default {
  title: 'Languages/Dialog',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['darkest'],
      express: false,
      locales: ['en-US'],
      scales: ['medium']
    }
  },
  excludeStories: ['TranslateDialogRender']
} as Meta<typeof Dialog>;

export type DialogLanguagesStory = StoryFn<typeof Dialog>;

export let TranslateDialogRender = (dialogProps: Omit<SpectrumDialogTriggerProps, 'children'>): JSX.Element => {
  let strings = useLocalizedStringFormatter(intlMessages);

  return (
    <DialogTrigger {...dialogProps}>
      <ActionButton>{strings.format('koji')}</ActionButton>
      {(close) => (
        <Dialog>
          <Heading>{strings.format('kojiFoods')}</Heading>
          <Header>{strings.format('foodsMakeWithKoji')}</Header>
          <Divider />
          <Content>
            <TagGroup aria-label={strings.format('kojiColors')}>
              <Item>{strings.format('white')}</Item>
              <Item>{strings.format('yellow')}</Item>
              <Item>{strings.format('black')}</Item>
            </TagGroup>
            <TableView aria-label={strings.format('foodsMakeWithKoji')} selectionMode="multiple">
              <TableHeader>
                <Column>{strings.format('name')}</Column>
                <Column>{strings.format('description')}</Column>
              </TableHeader>
              <TableBody>
                <Row>
                  <Cell>{strings.format('soySauce')}</Cell>
                  <Cell>{strings.format('soySauceDescription')}</Cell>
                </Row>
                <Row>
                  <Cell>{strings.format('miso')}</Cell>
                  <Cell>{strings.format('misoDescription')}</Cell>
                </Row>
                <Row>
                  <Cell>{strings.format('amazake')}</Cell>
                  <Cell>{strings.format('amazakeDescription')}</Cell>
                </Row>
                <Row>
                  <Cell>{strings.format('sake')}</Cell>
                  <Cell>{strings.format('sakeDescription')}</Cell>
                </Row>
                <Row>
                  <Cell>{strings.format('mirin')}</Cell>
                  <Cell>{strings.format('mirinDescription')}</Cell>
                </Row>
                <Row>
                  <Cell>{strings.format('riceWineVinegar')}</Cell>
                  <Cell>{strings.format('riceWineVinegarDescription')}</Cell>
                </Row>
              </TableBody>
            </TableView>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={close}>{strings.format('cancel')}</Button>
            <Button variant="cta" onPress={close}>{strings.format('confirm')}</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
};

export let TranslateDialog: DialogLanguagesStory = (args) => <TranslateDialogRender {...args} />;

export const ArabicComplex: DialogLanguagesStory = () => (
  <Provider locale="ar-AE">
    <TranslateDialogRender defaultOpen />
  </Provider>
);

export const HebrewComplex: DialogLanguagesStory = () => (
  <Provider locale="he-IL">
    <TranslateDialogRender defaultOpen />
  </Provider>
);

export const JapaneseComplex: DialogLanguagesStory = () => (
  <Provider locale="ja-JP">
    <TranslateDialogRender defaultOpen />
  </Provider>
);

export const KoreanComplex: DialogLanguagesStory = () => (
  <Provider locale="ko-KR">
    <TranslateDialogRender defaultOpen />
  </Provider>
);

export const ChineseSimplfiedComplex: DialogLanguagesStory = () => (
  <Provider locale="zh-CN">
    <TranslateDialogRender defaultOpen />
  </Provider>
);

export const ChineseTraditionalComplex: DialogLanguagesStory = () => (
  <Provider locale="zh-TW">
    <TranslateDialogRender defaultOpen />
  </Provider>
);
