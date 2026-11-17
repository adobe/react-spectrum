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

import {Example, Example2} from '../../stories/actionbar/Example';
import {Flex} from '../../src/layout/Flex';
import React from 'react';
import {StoryObj} from '@storybook/react';

export default {
  title: 'ActionBar'
};

export type ActionBarStory = StoryObj<typeof Example>;

export const Default: ActionBarStory = {
  render: () => (
    <Flex gap="size-250">
      <Example />
      <Example defaultSelectedKeys={new Set(['Foo 1'])} />
    </Flex>
  ),
  name: 'default'
};

export const IsEmphasized: ActionBarStory = {
  render: () => <Example isEmphasized defaultSelectedKeys={new Set(['Foo 1'])} />,
  name: 'isEmphasized'
};

export const LargeWidth: ActionBarStory = {
  render: () => (
    <Example isEmphasized tableWidth={800} isQuiet defaultSelectedKeys={new Set(['Foo 1'])} />
  ),
  name: 'large width'
};

export const CollapsedIcons: ActionBarStory = {
  render: () => (
    <Example isEmphasized tableWidth={500} isQuiet defaultSelectedKeys={new Set(['Foo 1'])} />
  ),
  name: 'collapsed icons'
};

export const CollapseRounding: ActionBarStory = {
  render: () => <Example2 tableWidth={800} defaultSelectedKeys={new Set(['Foo 1'])} />
};
