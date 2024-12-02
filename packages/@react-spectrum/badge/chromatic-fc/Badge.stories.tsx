/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Badge} from '..';
import {BadgeStory, renderVariants} from '../chromatic/Badge.stories';
import CheckmarkCircle from '@spectrum-icons/workflow/src/CheckmarkCircle';
import {ComponentMeta} from '@storybook/react';
import React from 'react';
import {Text} from '@react-spectrum/text';

export default {
  title: 'Badge',
  component: Badge
} as ComponentMeta<typeof Badge>;

export const TextIcon: BadgeStory = {
  name: 'Text & icon',
  args: {children: <><Text>Badge text</Text><CheckmarkCircle /></>},
  render: renderVariants
};
