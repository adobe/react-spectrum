/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, AlertDialog, DialogTrigger} from '../src';
import type {Meta, StoryObj} from '@storybook/react';

const meta: Meta<typeof AlertDialog> = {
  component: AlertDialog as any,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'AlertDialog'
};

export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const Example: Story = {
  render: (args) => {
    return (
      <DialogTrigger>
        <ActionButton>Save</ActionButton>
        <AlertDialog {...args} >
          You have not saved your profile information
          for this account. Would you like to register now?
        </AlertDialog>
      </DialogTrigger>
    );
  },
  args: {
    title: 'Register profile',
    cancelLabel: 'Cancel',
    secondaryActionLabel: 'Remind me later',
    primaryActionLabel: 'Register'
  }
};
