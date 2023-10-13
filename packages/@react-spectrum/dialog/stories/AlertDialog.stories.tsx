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
import {action} from '@storybook/addon-actions';
import {ActionButton} from '@react-spectrum/button';
import {AlertDialog, DialogTrigger} from '../';
import React from 'react';
import {singleParagraph} from './Dialog.stories';
import {SpectrumAlertDialogProps} from '@react-types/dialog';

export default {
  title: 'Dialog/Alert'
};

export const Destructive = () => renderAlert({
  variant: 'destructive',
  title: 'Warning Destructive',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel')
});

Destructive.story = {
  name: 'destructive'
};

export const Confirmation = () => renderAlert({
  variant: 'confirmation',
  title: 'Confirmation Required',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel')
});

Confirmation.story = {
  name: 'confirmation'
};

export const Information = () => renderAlert({
  variant: 'information',
  title: 'Informative Alert',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel')
});

Information.story = {
  name: 'information'
};

export const Error = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel')
});

Error.story = {
  name: 'error'
};

export const Warning = () => renderAlert({
  variant: 'warning',
  title: 'This is a warning',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel')
});

Warning.story = {
  name: 'warning'
};

export const PrimaryDisabled = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel'),
  isPrimaryActionDisabled: true
});

PrimaryDisabled.story = {
  name: 'primary disabled'
};

export const AutoFocusPrimary = () => renderAlert({
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
});

AutoFocusPrimary.story = {
  name: 'autoFocus primary'
};

export const SecondaryDisabled = () => renderAlert({
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
});

SecondaryDisabled.story = {
  name: 'secondary disabled'
};

export const AutoFocusSecondary = () => renderAlert({
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
});

AutoFocusSecondary.story = {
  name: 'autoFocus secondary'
};

export const AutoFocusCancel = () => renderAlert({
  variant: 'error',
  title: 'Error: Danger Will Robinson',
  children: singleParagraph(),
  primaryActionLabel: 'Accept',
  cancelLabel: 'Cancel',
  secondaryActionLabel: 'Secondary button',
  onPrimaryAction: action('primary'),
  onSecondaryAction: action('secondary'),
  onCancel: action('cancel'),
  autoFocusButton: 'cancel'
});

AutoFocusCancel.story = {
  name: 'autoFocus cancel'
};

function renderAlert({...props}: SpectrumAlertDialogProps) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        <AlertDialog {...props} onPrimaryAction={action('primary')} onSecondaryAction={action('secondary')} onCancel={props.onCancel} />
      </DialogTrigger>
    </div>
  );
}
