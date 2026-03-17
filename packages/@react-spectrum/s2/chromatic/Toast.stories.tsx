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

import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';
import {SpectrumToast, SpectrumToastValue} from '../src/Toast';
import {UNSTABLE_ToastStateContext} from 'react-aria-components';
import {useToastState} from 'react-stately';

function FakeToast(props: SpectrumToastValue) {
  return (
    <UNSTABLE_ToastStateContext.Provider value={useToastState()}>
      <SpectrumToast
        toast={{
          key: 'toast',
          content: props
        }} />
    </UNSTABLE_ToastStateContext.Provider>
  );
}

const meta: Meta<typeof FakeToast> = {
  component: FakeToast,
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], backgrounds: ['base'], locales: ['en-US'], disableAnimations: true}
  },
  tags: ['autodocs'],
  title: 'S2 Chromatic/Toast'
};

export default meta;
type Story = StoryObj<typeof FakeToast>;

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'Toast available'
  }
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Toasting…'
  }
};

export const Positive: Story = {
  args: {
    variant: 'positive',
    children: 'Toast is done!'
  }
};

export const Negative: Story = {
  args: {
    variant: 'negative',
    children: 'Toast is burned!'
  }
};

export const WithAction: Story = {
  args: {
    variant: 'positive',
    children: 'Toast is done!',
    actionLabel: 'Undo'
  }
};

export const LongContent: Story = {
  args: {
    variant: 'info',
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  }
};

export const LongContentWithAction: Story = {
  args: {
    variant: 'positive',
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    actionLabel: 'Undo'
  }
};

export const LongWord: Story = {
  args: {
    variant: 'info',
    children: 'LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimaminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipeacommodoconsequat.'
  }
};
