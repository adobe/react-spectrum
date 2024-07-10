
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

import {Default as DefaultStory, IsDisabledTrue, IsEmphasizedTrue, ValidationStateInvalid} from '../chromatic/Checkbox.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {View} from '@react-spectrum/view';

export default {
  title: 'Checkbox'
};

export const Default = () => (
  <Flex gap="size-100" direction={'column'}>
    <View>
      <h2>Default</h2>
      <DefaultStory />
    </View>
    <View>
      <h2>Invalid</h2>
      <ValidationStateInvalid />
    </View>
    <View>
      <h2>Disabled</h2>
      <IsDisabledTrue />
    </View>
    <View>
      <h2>Emphasized</h2>
      <IsEmphasizedTrue />
    </View>
  </Flex>
);

