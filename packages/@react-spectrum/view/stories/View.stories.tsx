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
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {View} from '../';

let meta = {
  title: 'View',
  component: View,
  args: {
    colorVersion: 5,
    backgroundColor: 'blue-400'
  }
} as Meta<typeof View>;

export default meta;

export const Default: StoryFn<typeof View> = (args) => (
  <View
    {...args}
    width="single-line-width"
    height="size-500"
    elementType="span" />
);
