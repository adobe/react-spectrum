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

import {ActionButton} from '../';
import Add from '@spectrum-icons/workflow/Add';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {View} from '@react-spectrum/view';

export default {
  title: 'Languages/ActionButton',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      express: false,
      locales: ['en-US', 'ja-JP'],
      scales: ['large', 'medium']
    }
  }
};

export const JapaneseIconTextStaticColorWhite = () => (
  <View backgroundColor="static-blue-700" padding="size-1000">
    <Flex direction="column" rowGap="size-150">
      <ActionButton staticColor="white">
        <Add />
        <Text>ディフォルト</Text>
      </ActionButton>
      <ActionButton staticColor="white" isQuiet>
        <Add />
        <Text>静かな</Text>
      </ActionButton>
      <ActionButton staticColor="white" isDisabled>
        <Text>無効</Text>
        <Add />
      </ActionButton>
    </Flex>
  </View>
);

JapaneseIconTextStaticColorWhite.story = {
  name: 'Japanese, icon + text, staticColor: white'
};
