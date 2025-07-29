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
import {Render} from '../chromatic/LogicButton.stories';
import {StoryFn} from '@storybook/react';

export default {
  title: 'Button/LogicButton'
};

export type LogicButtonStory = StoryFn<typeof Render>;

export const All: LogicButtonStory = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>And</h2>
    <Render variant="and" />
    <h2>Or</h2>
    <Render variant="or" />
  </Flex>
);
All.story = {
  name: 'all'
};
