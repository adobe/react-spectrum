/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {action} from 'storybook/actions';
import {ActionButton} from '../../src/button/ActionButton';
import {AlertDialog, SpectrumAlertDialogProps} from '../../src/dialog/AlertDialog';
import {DialogTrigger} from '../../src/dialog/DialogTrigger';
import {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {singleParagraph} from './Dialog.stories';

export default {
  title: 'Dialog/Alert'
} as Meta<typeof AlertDialog>;

export type AlertDialogStory = StoryObj<typeof AlertDialog>;

export const Destructive: AlertDialogStory = {
  render: () =>
    renderAlert({
      variant: 'destructive',
      title: 'Warning Destructive',
      children: singleParagraph(),
      primaryActionLabel: 'Accept',
      cancelLabel: 'Cancel',
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel')
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
      cancelLabel: 'Cancel',
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel')
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
      cancelLabel: 'Cancel',
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel')
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
      cancelLabel: 'Cancel',
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel')
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
      cancelLabel: 'Cancel',
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel')
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
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel'),
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
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel'),
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
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel'),
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
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel'),
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
      onPrimaryAction: action('primary'),
      onSecondaryAction: action('secondary'),
      onCancel: action('cancel'),
      autoFocusButton: 'cancel',
      'data-testid': 'alert-dialog'
    } as SpectrumAlertDialogProps),
  name: 'autoFocus cancel'
};

function renderAlert({...props}: SpectrumAlertDialogProps) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        <AlertDialog
          {...props}
          onPrimaryAction={action('primary')}
          onSecondaryAction={action('secondary')}
          onCancel={props.onCancel}
        />
      </DialogTrigger>
    </div>
  );
}
