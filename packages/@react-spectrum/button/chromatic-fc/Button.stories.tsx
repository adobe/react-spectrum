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

import {ElementA, VariantAccent, VariantNegative, VariantPrimary, WithIcon} from '../chromatic/Button.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';

export default {
  title: 'Button'
};

export const All = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>Accent</h2>
    <VariantAccent />
    <h2>Primary</h2>
    <VariantPrimary />
    <h2>Negative</h2>
    <VariantNegative />
    <h2>element a</h2>
    <ElementA />
    <h2>with icon</h2>
    <WithIcon />
  </Flex>
);
All.story = {
  name: 'all'
};
