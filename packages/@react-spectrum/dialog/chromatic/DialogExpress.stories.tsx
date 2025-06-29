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

import {Dialog} from '../';
import {Meta, StoryFn} from '@storybook/react';
import {renderAlert} from './AlertDialog.stories';
import {renderTriggerProps, singleParagraph} from './Dialog.stories';

export default {
  title: 'Dialog/Express',
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['medium'], disableAnimations: true, express: true}
  }
} as Meta<typeof Dialog>;

export type DialogExpressStory = StoryFn<typeof Dialog>;

export const _Destructive: DialogExpressStory = () => renderAlert({
  variant: 'destructive',
  title: 'Warning Destructive',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

_Destructive.story = {
  name: 'destructive'
};

export const _Confirmation: DialogExpressStory = () => renderAlert({
  variant: 'confirmation',
  title: 'Confirmation Required',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

_Confirmation.story = {
  name: 'confirmation'
};

export const _Information: DialogExpressStory = () => renderAlert({
  variant: 'information',
  title: 'Informative Alert',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

_Information.story = {
  name: 'information'
};

export const _Error: DialogExpressStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

_Error.story = {
  name: 'error'
};

export const _Warning: DialogExpressStory = () => renderAlert({
  variant: 'warning',
  title: 'This is a warning',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

_Warning.story = {
  name: 'warning'
};

export const _Tray: DialogExpressStory = () => renderTriggerProps({type: 'tray'});

_Tray.story = {
  name: 'tray',

  parameters: {
    chromatic: {viewports: [320, 1200]}
  }
};

export const _Popover: DialogExpressStory = () => renderTriggerProps({type: 'popover'});

_Popover.story = {
  name: 'popover',

  parameters: {
    chromatic: {viewports: [320, 1200]}
  }
};
