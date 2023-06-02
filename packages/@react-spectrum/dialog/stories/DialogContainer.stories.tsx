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

import {
  DialogContainerExample,
  MenuExample,
  NestedDialogContainerExample
} from './DialogContainerExamples';
import React from 'react';

export default {
  title: 'DialogContainer',
  providerSwitcher: {status: 'notice'}
};

export const Default = () => <DialogContainerExample />;

Default.story = {
  name: 'default'
};

export const InAMenu = () => <MenuExample />;

InAMenu.story = {
  name: 'in a menu'
};

export const TypeFullscreen = () => <MenuExample type="fullscreen" />;

TypeFullscreen.story = {
  name: 'type: fullscreen'
};

export const TypeFullscreenTakeover = () => <MenuExample type="fullscreenTakeover" />;

TypeFullscreenTakeover.story = {
  name: 'type: fullscreenTakeover'
};

export const IsDismissable = () => <MenuExample isDismissable />;

IsDismissable.story = {
  name: 'isDismissable'
};

export const IsKeyboardDismissDisabled = () => <MenuExample isKeyboardDismissDisabled />;

IsKeyboardDismissDisabled.story = {
  name: 'isKeyboardDismissDisabled'
};

export const NestedDialogContainers = () => <NestedDialogContainerExample />;
