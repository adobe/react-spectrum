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

import {Item, Picker, Section} from '..';
import {Meta} from '@storybook/react';
import React from 'react';
import {SpectrumPickerProps} from '@react-types/select';

export default {
  title: 'Languages/Picker',
  component: Picker,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], express: false, locales: ['en-US'], scales: ['large', 'medium']}
  }
} as Meta<typeof Picker>;

const Template = (args: SpectrumPickerProps<object>) => (
  <Picker {...args}>
    <Section title="Animals">
      <Item key="Aardvark">Aardvark</Item>
      <Item key="Kangaroo">Kangaroo</Item>
      <Item key="Snake">Snake</Item>
    </Section>
    <Section title="People">
      <Item key="Danni">Danni</Item>
      <Item key="Devon">Devon</Item>
      <Item key="Ross">Ross</Item>
    </Section>
  </Picker>
);
export const ArabicPlaceholder = {
  render: Template,
  args: {label: 'Pick your favorite', placeholder: 'دولفين'},

  parameters: {
    chromaticProvider: {locales: ['ar-AE']}
  }
};

export const ChineseSimplifiedPlaceholder = {
  render: Template,
  args: {label: 'Pick your favorite', placeholder: '海豚'},

  parameters: {
    chromaticProvider: {locales: ['zh-CN']}
  }
};

export const ChineseTraditionalPlaceholder = {
  render: Template,
  args: {label: 'Pick your favorite', placeholder: '海豚'},

  parameters: {
    chromaticProvider: {locales: ['zh-TW']}
  }
};

export const JapanesePlaceholder = {
  render: Template,
  args: {label: 'Pick your favorite', placeholder: 'イルカ'},

  parameters: {
    chromaticProvider: {locales: ['ja-JP']}
  }
};

export const KoreanPlaceholder = {
  render: Template,
  args: {label: 'Pick your favorite', placeholder: '돌고래'},

  parameters: {
    chromaticProvider: {locales: ['ko-KR']}
  }
};
