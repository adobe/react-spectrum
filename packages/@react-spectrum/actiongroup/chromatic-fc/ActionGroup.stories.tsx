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


import {docItems, editItems, Render, viewItems} from '../chromatic/ActionGroup.stories';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {StoryFn} from '@storybook/react';
import {View} from '@react-spectrum/view';

export default {
  title: 'ActionGroup'
};

export type ActionGroupStory = StoryFn<typeof Render>;

export const All: ActionGroupStory = () => (
  <Flex gap="size-100" direction={'column'}>
    <h2>default</h2>
    <Render items={docItems} />
    <h2>isDisabled</h2>
    <Render items={docItems} isDisabled defaultSelectedKeys={['1']} />
    <h2>compact</h2>
    <Render items={viewItems} density="compact" defaultSelectedKeys={['1']} />
    <h2>isQuiet</h2>
    <Render items={editItems} isQuiet defaultSelectedKeys={['1']} />
    <h2>isEmphasized</h2>
    <Render items={docItems} isEmphasized defaultSelectedKeys={['1']} />
    <h2>staticColor: black</h2>
    <View backgroundColor="static-yellow-400" padding="size-1000">
      <Render items={viewItems} staticColor="black" defaultSelectedKeys={['1']} />
    </View>
    <h2>staticColor: white</h2>
    <View backgroundColor="static-blue-700" padding="size-1000">
      <Render items={viewItems} staticColor="white" defaultSelectedKeys={['1']} />
    </View>
  </Flex>
);

All.story = {
  name: 'all'
};
