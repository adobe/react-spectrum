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

import Add from '@spectrum-icons/workflow/Add';
import Alert from '@spectrum-icons/workflow/Alert';
import Bell from '@spectrum-icons/workflow/Bell';
import Draw from '@spectrum-icons/workflow/Draw';
// @ts-ignore
import intlMessages from './intlMessages.json';
import {Item, ListBox, Section} from '..';
import {Label} from '@react-spectrum/label';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export default {
  title: 'Languages/ListBox',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['en-US'],
      scales: ['large']
    }
  },
  excludeStories: ['TranslateListBox']
};

export let TranslateListBox = () => {
  let strings = useLocalizedStringFormatter(intlMessages);

  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <Label id="label">{strings.format('selectAction')}</Label>
      <div
        style={{
          display: 'flex',
          minWidth: '200px',
          background: 'var(--spectrum-global-color-gray-50)',
          border: '1px solid lightgray',
          maxHeight: '100%'
        }}>
        <ListBox
          aria-labelledby="label"
          flexGrow={1}
          autoFocus
          selectionMode="multiple"
          defaultSelectedKeys={['queue', 'subscribe']}
          disabledKeys={['report']}>
          <Section title={strings.format('actions')}>
            <Item key="queue" textValue={strings.format('addToQueue')}>
              <Add />
              <Text>{strings.format('addToQueue')}</Text>
              <Text slot="description">{strings.format('addToCurrentWatchQueue')}</Text>
            </Item>
            <Item key="review" textValue={strings.format('addReview')}>
              <Draw />
              <Text>{strings.format('addReview')}</Text>
              <Text slot="description">{strings.format('postAReviewForTheEpisode')}</Text>
            </Item>
            <Item key="subscribe" textValue={strings.format('subscribeToSeries')}>
              <Bell />
              <Text>{strings.format('subscribeToSeries')}</Text>
              <Text slot="description">{strings.format('addSeriesToSubscription')}</Text>
            </Item>
            <Item key="report" textValue={strings.format('report')}>
              <Alert />
              <Text>{strings.format('report')}</Text>
              <Text slot="description">{strings.format('reportAnIssue')}</Text>
            </Item>
          </Section>
        </ListBox>
      </div>
    </div>
  );
};

export const ArabicComplex = () => (
  <Provider locale="ar-AE">
    <TranslateListBox />
  </Provider>
);

export const HebrewComplex = () => (
  <Provider locale="he-IL">
    <TranslateListBox />
  </Provider>
);

export const JapaneseComplex = () => (
  <Provider locale="ja-JP">
    <TranslateListBox />
  </Provider>
);

export const KoreanComplex = () => (
  <Provider locale="ko-KR">
    <TranslateListBox />
  </Provider>
);

export const ChineseSimplfiedComplex = () => (
  <Provider locale="zh-CN">
    <TranslateListBox />
  </Provider>
);

export const ChineseTraditionalComplex = () => (
  <Provider locale="zh-TW">
    <TranslateListBox />
  </Provider>
);
