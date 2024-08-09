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
import {SearchField} from '@adobe/react-spectrum';
import {singleParagraph} from './Dialog.stories';
import {SpectrumAlertDialogProps} from '@react-types/dialog';

export default {
  title: 'Dialog/Alert',
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    onPrimaryAction: {
      table: {
        disable: true
      }
    },
    onSecondaryAction: {
      table: {
        disable: true
      }
    },
    onCancel: {
      table: {
        disable: true
      }
    }
  }
};

export const Destructive = {
  render: renderAlert,
  args: {
    variant: 'destructive',
    title: 'Warning Destructive',
    children: singleParagraph(),
    primaryActionLabel: 'Accept',
    cancelLabel: 'Cancel',
    onPrimaryAction: action('primary'),
    onSecondaryAction: action('secondary'),
    onCancel: action('cancel')
  },
  name: 'destructive'
};

export const Confirmation = {
  render: renderAlert,
  args: {
    ...Destructive.args,
    variant: 'confirmation',
    title: 'Confirmation Required'
  },
  name: 'confirmation'
};

export const Information = {
  render: renderAlert,
  args: {
    ...Destructive.args,
    variant: 'information',
    title: 'Informative Alert'
  },
  name: 'information'
};

export const Error = {
  render: renderAlert,
  args: {
    ...Destructive.args,
    variant: 'error',
    title: 'Error: Danger Will Robinson'
  },
  name: 'error'
};

export const Warning = {
  render: renderAlert,
  args: {
    ...Destructive.args,
    variant: 'warning',
    title: 'This is a warning'
  },
  name: 'warning'
};

export const PrimaryDisabled = {
  render: renderAlert,
  args: {
    ...Error.args,
    secondaryActionLabel: 'Secondary button',
    isPrimaryActionDisabled: true
  },
  name: 'primary disabled'
};

export const AutoFocusPrimary = {
  render: renderAlert,
  args: {
    ...Error.args,
    secondaryActionLabel: 'Secondary button',
    autoFocusButton: 'primary'
  },
  name: 'autoFocus primary'
};

export const SecondaryDisabled = {
  render: renderAlert,
  args: {
    ...Error.args,
    secondaryActionLabel: 'Secondary button',
    isSecondaryActionDisabled: true
  },
  name: 'secondary disabled'
};

export const AutoFocusSecondary = {
  render: renderAlert,
  args: {
    ...Error.args,
    secondaryActionLabel: 'Secondary button',
    autoFocusButton: 'secondary'
  },
  name: 'autoFocus secondary'
};

export const AutoFocusCancel = {
  render: renderAlert,
  args: {
    ...Error.args,
    secondaryActionLabel: 'Secondary button',
    autoFocusButton: 'cancel'
  },
  name: 'autoFocus cancel'
};

function renderAlert({...props}: SpectrumAlertDialogProps) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <DialogTrigger>
        <ActionButton>Trigger</ActionButton>
        <AlertDialog {...props} onPrimaryAction={action('primary')} onSecondaryAction={action('secondary')} onCancel={props.onCancel} />
      </DialogTrigger>
    </div>
  );
}

export const WithPending = {
  render: renderAlert,
  args: {
    ...Confirmation.args,
    secondaryActionLabel: 'Secondary button',
    children: (
      <>
        {singleParagraph()}
        <SearchField label="Search" />
      </>
    )
  },
  argTypes: {
    pendingAction: {
      control: 'radio',
      options: ['primary', 'secondary', undefined]
    }
  }
};
