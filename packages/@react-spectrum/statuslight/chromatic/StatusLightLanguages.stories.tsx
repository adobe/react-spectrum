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

import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {StatusLight} from '../';

export default {
  title: 'Languages/StatusLight',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'],
      scales: ['large', 'medium']
    }
  }
};

export const NeutralNoItalicInCcjk = () => (
  <Flex gap="size-200" direction="row" wrap>
    <StatusLight variant="neutral">Help</StatusLight>
    <StatusLight variant="neutral">مساعدة</StatusLight>
    <StatusLight variant="neutral">帮助</StatusLight>
    <StatusLight variant="neutral">說明</StatusLight>
    <StatusLight variant="neutral">ヘルプ</StatusLight>
    <StatusLight variant="neutral">도움말</StatusLight>
  </Flex>
);

NeutralNoItalicInCcjk.story = {
  name: 'Neutral: no italic in CCJK'
};
