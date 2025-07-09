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

import {ActionButton} from '@react-spectrum/button';
import {AlertDialog, DialogTrigger} from '../';
import {Meta, StoryFn} from '@storybook/react';
import React, {JSX} from 'react';
import {singleParagraph} from './Dialog.stories';
import {SpectrumAlertDialogProps} from '@react-types/dialog';

export default {
  title: 'Dialog/Alert',
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['medium'], disableAnimations: true, express: false}
  },
  excludeStories: ['renderAlert']
} as Meta<typeof AlertDialog>;

export type AlertDialogStory = StoryFn<typeof AlertDialog>;

export const Destructive: AlertDialogStory = () => renderAlert({
  variant: 'destructive',
  title: 'Warning Destructive',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

Destructive.story = {
  name: 'destructive'
};

export const Confirmation: AlertDialogStory = () => renderAlert({
  variant: 'confirmation',
  title: 'Confirmation Required',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

Confirmation.story = {
  name: 'confirmation'
};

export const Information: AlertDialogStory = () => renderAlert({
  variant: 'information',
  title: 'Informative Alert',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

Information.story = {
  name: 'information'
};

export const Error: AlertDialogStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

Error.story = {
  name: 'error'
};

export const Warning: AlertDialogStory = () => renderAlert({
  variant: 'warning',
  title: 'This is a warning',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel'
});

Warning.story = {
  name: 'warning'
};

export const PrimaryDisabled: AlertDialogStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  isPrimaryActionDisabled: true
});

PrimaryDisabled.story = {
  name: 'primary disabled'
};

export const AutoFocusPrimary: AlertDialogStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  secondaryActionLabel: 'Secondary button',
  autoFocusButton: 'primary'
});

AutoFocusPrimary.story = {
  name: 'autoFocus primary'
};

export const SecondaryDisabled: AlertDialogStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  secondaryActionLabel: 'Secondary button',
  cancelLabel: 'Cancel',
  isSecondaryActionDisabled: true
});

SecondaryDisabled.story = {
  name: 'secondary disabled'
};

export const AutoFocusSecondary: AlertDialogStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  secondaryActionLabel: 'Secondary button',
  autoFocusButton: 'secondary'
});

AutoFocusSecondary.story = {
  name: 'autoFocus secondary'
};

export const AutoFocusCancel: AlertDialogStory = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  secondaryActionLabel: 'Secondary button',
  autoFocusButton: 'cancel'
});

AutoFocusCancel.story = {
  name: 'autoFocus cancel'
};

export function renderAlert({...props}: SpectrumAlertDialogProps): JSX.Element {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        <AlertDialog {...props} />
      </DialogTrigger>
    </div>
  );
}
