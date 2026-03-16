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

import {DialogContainer} from '../';
import {
  DialogContainerExample,
  MenuExample,
  NestedDialogContainerExample
} from './DialogContainerExamples';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';

export default {
  title: 'DialogContainer',
  providerSwitcher: {status: 'notice'}
} as Meta<typeof DialogContainer>;

export type DialogContainerStory = StoryFn<typeof DialogContainer>;

export const Default: DialogContainerStory = () => <DialogContainerExample />;

Default.story = {
  name: 'default'
};

export const InAMenu: DialogContainerStory = () => <MenuExample />;

InAMenu.story = {
  name: 'in a menu'
};

export const TypeFullscreen: DialogContainerStory = () => <MenuExample type="fullscreen" />;

TypeFullscreen.story = {
  name: 'type: fullscreen'
};

export const TypeFullscreenTakeover: DialogContainerStory = () => <MenuExample type="fullscreenTakeover" />;

TypeFullscreenTakeover.story = {
  name: 'type: fullscreenTakeover'
};

export const IsDismissable: DialogContainerStory = () => <MenuExample isDismissable />;

IsDismissable.story = {
  name: 'isDismissable'
};

export const IsKeyboardDismissDisabled: DialogContainerStory = () => <MenuExample isKeyboardDismissDisabled />;

IsKeyboardDismissDisabled.story = {
  name: 'isKeyboardDismissDisabled'
};

export const NestedDialogContainers: DialogContainerStory = () => <NestedDialogContainerExample />;
