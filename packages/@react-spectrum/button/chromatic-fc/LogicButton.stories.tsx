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
import {LogicVariantAnd, LogicVariantOr} from '../chromatic/LogicButton.stories';
import React from 'react';

export default {
  title: 'Button/LogicButton'
};

export const All = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>And</h2>
    <LogicVariantAnd />
    <h2>Or</h2>
    <LogicVariantOr />
  </Flex>
);
All.story = {
  name: 'all'
};
