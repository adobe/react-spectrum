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

import {Example, Example2} from '../stories/Example';
import {Flex} from '@react-spectrum/layout';
import React from 'react';
import {StoryFn} from '@storybook/react';

export default {
  title: 'ActionBar'
};

export type ActionBarStory = StoryFn<typeof Example>;

export const Default: ActionBarStory = () => (
  <Flex gap="size-250">
    <Example />
    <Example defaultSelectedKeys={new Set(['Foo 1'])} />
  </Flex>
);

Default.story = {
  name: 'default'
};

export const IsEmphasized: ActionBarStory = () => <Example isEmphasized defaultSelectedKeys={new Set(['Foo 1'])} />;

IsEmphasized.story = {
  name: 'isEmphasized'
};

export const LargeWidth: ActionBarStory = () => (
  <Example isEmphasized tableWidth={800} isQuiet defaultSelectedKeys={new Set(['Foo 1'])} />
);

LargeWidth.story = {
  name: 'large width'
};

export const CollapsedIcons: ActionBarStory = () => (
  <Example isEmphasized tableWidth={500} isQuiet defaultSelectedKeys={new Set(['Foo 1'])} />
);

CollapsedIcons.story = {
  name: 'collapsed icons'
};

export const CollapseRounding: ActionBarStory = () => (
  <Example2 tableWidth={800} defaultSelectedKeys={new Set(['Foo 1'])} />
);
