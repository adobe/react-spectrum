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
import {ComponentMeta, Story} from '@storybook/react';
import {Item, Picker, Section} from '..';
import React from 'react';
import {SpectrumPickerProps} from '@react-types/select';

export default {
  title: 'Languages/Picker',
  component: Picker,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], express: false, locales: ['en-US'], scales: ['large', 'medium']}
  }
} as ComponentMeta<typeof Picker>;

const Template = <T extends object>(): Story<SpectrumPickerProps<T>> => (args) => (
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

export const ArabicPlaceholder = Template().bind({});
ArabicPlaceholder.args = {label: 'Pick your favorite', placeholder: 'دولفين'};
ArabicPlaceholder.parameters = {
  chromaticProvider: {locales: ['ar-AE']}
};

export const ChineseSimplifiedPlaceholder = Template().bind({});
ChineseSimplifiedPlaceholder.args = {label: 'Pick your favorite', placeholder: '海豚'};
ChineseSimplifiedPlaceholder.parameters = {
  chromaticProvider: {locales: ['zh-CN']}
};

export const ChineseTraditionalPlaceholder = Template().bind({});
ChineseTraditionalPlaceholder.args = {label: 'Pick your favorite', placeholder: '海豚'};
ChineseTraditionalPlaceholder.parameters = {
  chromaticProvider: {locales: ['zh-TW']}
};

export const JapanesePlaceholder = Template().bind({});
JapanesePlaceholder.args = {label: 'Pick your favorite', placeholder: 'イルカ'};
JapanesePlaceholder.parameters = {
  chromaticProvider: {locales: ['ja-JP']}
};

export const KoreanPlaceholder = Template().bind({});
KoreanPlaceholder.args = {label: 'Pick your favorite', placeholder: '돌고래'};
KoreanPlaceholder.parameters = {
  chromaticProvider: {locales: ['ko-KR']}
};
