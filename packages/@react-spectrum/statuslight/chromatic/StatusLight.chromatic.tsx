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

import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {SpectrumStatusLightProps} from '@react-types/statuslight';
import {StatusLight} from '../';
import {storiesOf} from '@storybook/react';
import {View} from '@react-spectrum/view';

let variants = ['celery', 'yellow', 'fuchsia', 'indigo', 'seafoam', 'chartreuse', 'magenta', 'purple', 'neutral', 'info', 'positive', 'notice', 'negative', 'positive'] as SpectrumStatusLightProps['variant'][];

storiesOf('StatusLight', module)
  .add(
    'all variants',
    () => render()
  )
  .add(
    'multiline',
    () => (
      <View width="size-3000">
        <StatusLight variant="celery">Super long status light label. Sample text. Arma virumque cano, Troiae qui primus ab oris.</StatusLight>
      </View>
    )
  );

storiesOf('Languages/StatusLight', module)
  .addParameters({
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['ar-AE', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'],
      scales: ['large', 'medium']
    }
  })
  .add(
    'Neutral: no italic in CCJK',
    () => (
      <Flex gap="size-200" direction="row" wrap>
        <StatusLight variant="neutral">Help</StatusLight>
        <StatusLight variant="neutral">مساعدة</StatusLight>
        <StatusLight variant="neutral">帮助</StatusLight>
        <StatusLight variant="neutral">說明</StatusLight>
        <StatusLight variant="neutral">ヘルプ</StatusLight>
        <StatusLight variant="neutral">도움말</StatusLight>
      </Flex>
    )
  );

function render() {
  return (
    <Flex wrap>
      {variants.map((variant: SpectrumStatusLightProps['variant']) => (
        <>
          <StatusLight variant={variant}>Status light {variant}</StatusLight>
          <StatusLight variant={variant} isDisabled>Disabled {variant}</StatusLight>
        </>
      ))}
    </Flex>
  );
}
