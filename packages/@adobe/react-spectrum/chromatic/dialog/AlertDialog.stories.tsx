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

import {ActionButton} from '../../src/button/ActionButton';

import {AlertDialog, SpectrumAlertDialogProps} from '../../src/dialog/AlertDialog';
import {DialogTrigger} from '../../src/dialog/DialogTrigger';
import {Meta, StoryObj} from '@storybook/react';
import React, {JSX} from 'react';
import {singleParagraph} from './Dialog.stories';

export default {
  title: 'Dialog/Alert',
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en-US'],
      scales: ['medium'],
      disableAnimations: true,
      express: false
    }
  },
  excludeStories: ['renderAlert']
} as Meta<typeof AlertDialog>;

export type AlertDialogStory = StoryObj<typeof AlertDialog>;

export const Destructive: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'destructive',
      title: 'Warning Destructive',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel'
    }),
  name: 'destructive'
};

export const Confirmation: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'confirmation',
      title: 'Confirmation Required',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel'
    }),
  name: 'confirmation'
};

export const Information: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'information',
      title: 'Informative Alert',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel'
    }),
  name: 'information'
};

export const Error: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel'
    }),
  name: 'error'
};

export const Warning: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'warning',
      title: 'This is a warning',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel'
    }),
  name: 'warning'
};

export const PrimaryDisabled: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel',
      isPrimaryActionDisabled: true
    }),
  name: 'primary disabled'
};

export const AutoFocusPrimary: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel',
      secondaryActionLabel: 'Secondary button',
      autoFocusButton: 'primary'
    }),
  name: 'autoFocus primary'
};

export const SecondaryDisabled: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      secondaryActionLabel: 'Secondary button',
      cancelLabel: 'Cancel',
      isSecondaryActionDisabled: true
    }),
  name: 'secondary disabled'
};

export const AutoFocusSecondary: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel',
      secondaryActionLabel: 'Secondary button',
      autoFocusButton: 'secondary'
    }),
  name: 'autoFocus secondary'
};

export const AutoFocusCancel: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel',
      secondaryActionLabel: 'Secondary button',
      autoFocusButton: 'cancel'
    }),
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
