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

import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {Render} from '../chromatic/Button.stories';
import {StoryFn} from '@storybook/react';
import {Text} from '@react-spectrum/text';

export default {
  title: 'Button'
};

export type ButtonStory = StoryFn<typeof Render>;

export const All: ButtonStory = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>Accent</h2>
    <Render variant="accent" />
    <h2>Primary</h2>
    <Render variant="primary" />
    <h2>Negative</h2>
    <Render variant="negative" />
    <h2>element a</h2>
    <Render elementType="a" variant="primary" />
    <h2>with icon</h2>
    <Flex gap="size-200">
      <Button variant="primary">
        <Bell />
        <Text>Default</Text>
      </Button>
      <Button
        isDisabled
        variant="primary">
        <Text>Disabled</Text>
        <Bell />
      </Button>
    </Flex>
  </Flex>
);
All.story = {
  name: 'all'
};
