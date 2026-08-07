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

import {Checkbox} from '../../src/checkbox/Checkbox';
import {Flex} from '../../src/layout/Flex';
import React from 'react';
import {Render} from '../../chromatic/checkbox/Checkbox.stories';
import {StoryFn} from '@storybook/react';
import {View} from '../../src/view/View';

export default {
  title: 'Checkbox'
};

export type CheckboxStory = StoryFn<typeof Checkbox>;

export const Default: CheckboxStory = () => (
  <Flex gap="size-100" direction={'column'}>
    <View>
      <h2>Default</h2>
      <Render />
    </View>
    <View>
      <h2>Invalid</h2>
      <Render isInvalid />
    </View>
    <View>
      <h2>Disabled</h2>
      <Render isDisabled />
    </View>
    <View>
      <h2>Emphasized</h2>
      <Render isEmphasized />
    </View>
  </Flex>
);
