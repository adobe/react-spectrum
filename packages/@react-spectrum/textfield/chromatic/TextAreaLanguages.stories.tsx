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

import Info from '@spectrum-icons/workflow/Info';
import React from 'react';
import {render} from './TextArea.stories';

export default {
  title: 'Languages/TextArea',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'zh-TW'],
      scales: ['large', 'medium']
    }
  }
};

export const Value測試IconInfoLabelPositionSideValidationStateValid = () => render({value: '測試', icon: <Info />, labelPosition: 'side', validationState: 'valid'});

Value測試IconInfoLabelPositionSideValidationStateValid.story = {
  name: 'value: 測試, icon: Info, labelPosition: side, validationState: valid'
};

export const ValueاختبارIsRequiredFalseNecessityIndicatorLabel = () => render({value: 'اختبار', isRequired: false, necessityIndicator: 'label'});

ValueاختبارIsRequiredFalseNecessityIndicatorLabel.story = {
  name: 'value: اختبار, isRequired: false, necessityIndicator: label'
};
