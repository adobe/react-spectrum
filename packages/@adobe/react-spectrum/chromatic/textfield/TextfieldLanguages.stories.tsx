/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Flex} from '../../src/layout/Flex';
import Info from '@spectrum-icons/workflow/Info';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {render} from './Textfield.stories';
import {TextField} from '../../src/textfield/TextField';

export default {
  title: 'Languages/Textfield',

  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'fr-FR', 'de-DE', 'zh-TW'],
      scales: ['large', 'medium']
    }
  }
} as Meta<typeof TextField>;

export type TextFieldStory = StoryObj<typeof TextField>;

export const Diacritics: TextFieldStory = {
  render: () => (
    <Flex gap="size-200" direction="row" wrap>
      <TextField label="Label" value="value" />
      <TextField label="رِفِتـــانٍ خانٍِ" value="رِفِتـــانٍ خانٍِ" />
      <TextField label="Ç" value="Ç" />
      <TextField label="Äpfel" value="Äpfel" />
    </Flex>
  ),
  name: 'diacritics'
};

export const Value測試IconInfoLabelPositionSideValidationStateValid: TextFieldStory = {
  render: () =>
    render({value: '測試', icon: <Info />, labelPosition: 'side', validationState: 'valid'}),
  name: 'value: 測試, icon: Info, labelPosition: side, validationState: valid'
};

export const ValueاختبارIsRequiredFalseNecessityIndicatorLabel: TextFieldStory = {
  render: () => render({value: 'اختبار', isRequired: false, necessityIndicator: 'label'}),
  name: 'value: اختبار, isRequired: false, necessityIndicator: label'
};
