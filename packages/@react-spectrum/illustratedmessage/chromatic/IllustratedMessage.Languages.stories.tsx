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
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import {Content} from '@react-spectrum/view';
import {Flex} from '@react-spectrum/layout';
import {Heading} from '@react-spectrum/text';
import {IllustratedMessage} from '..';
import NotFound from '@spectrum-icons/illustrations/src/NotFound';
import React from 'react';

type IllustratedMessageStory = ComponentStoryObj<typeof IllustratedMessage>;

export default {
  title: 'Languages/IllustratedMessage',
  component: IllustratedMessage,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'],
      scales: ['large', 'medium']
    }
  }
} as ComponentMeta<typeof IllustratedMessage>;

export const _NotFound: IllustratedMessageStory = {
  render: () => (
    <Flex gap="size-200" direction="row" wrap>
      <IllustratedMessage width="size-2000">
        <NotFound />
        <Heading>Error 404</Heading>
        <Content>Page not found</Content>
      </IllustratedMessage>
      <IllustratedMessage width="size-2000">
        <NotFound />
        <Heading>404 خطأ</Heading>
        <Content>الصفحة غير موجودة</Content>
      </IllustratedMessage>
      <IllustratedMessage width="size-2000">
        <NotFound />
        <Heading>错误 404</Heading>
        <Content>找不到网页</Content>
      </IllustratedMessage>
      <IllustratedMessage width="size-2000">
        <NotFound />
        <Heading>錯誤 404</Heading>
        <Content>找不到網頁</Content>
      </IllustratedMessage>
      <IllustratedMessage width="size-2000">
        <NotFound />
        <Heading>エラー 404</Heading>
        <Content>ページが見つかりません</Content>
      </IllustratedMessage>
      <IllustratedMessage width="size-2000">
        <NotFound />
        <Heading>오류 404</Heading>
        <Content>페이지를 찾을 수 없음</Content>
      </IllustratedMessage>
    </Flex>
  ),
  name: 'Not found: no italic in CCJK'
};
