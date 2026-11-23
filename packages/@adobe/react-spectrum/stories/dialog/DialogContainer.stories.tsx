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

import {DialogContainer} from '../../src/dialog/DialogContainer';
import {
  DialogContainerExample,
  MenuExample,
  NestedDialogContainerExample
} from './DialogContainerExamples';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';

export default {
  title: 'DialogContainer',
  providerSwitcher: {status: 'notice'}
} as Meta<typeof DialogContainer>;

export type DialogContainerStory = StoryObj<typeof DialogContainer>;

export const Default: DialogContainerStory = {
  render: () => <DialogContainerExample />,
  name: 'default'
};

export const InAMenu: DialogContainerStory = {
  render: () => <MenuExample />,
  name: 'in a menu'
};

export const TypeFullscreen: DialogContainerStory = {
  render: () => <MenuExample type="fullscreen" />,
  name: 'type: fullscreen'
};

export const TypeFullscreenTakeover: DialogContainerStory = {
  render: () => <MenuExample type="fullscreenTakeover" />,
  name: 'type: fullscreenTakeover'
};

export const IsDismissable: DialogContainerStory = {
  render: () => <MenuExample isDismissable />,
  name: 'isDismissable'
};

export const IsKeyboardDismissDisabled: DialogContainerStory = {
  render: () => <MenuExample isKeyboardDismissDisabled />,
  name: 'isKeyboardDismissDisabled'
};

export const NestedDialogContainers: DialogContainerStory = {
  render: () => <NestedDialogContainerExample />
};
