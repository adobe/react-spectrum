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

import {action} from '@storybook/addon-actions';
import {Button, ButtonGroup, ToastContainer, ToastQueue} from '../src';
import type {Meta, StoryObj} from '@storybook/react';
import {SpectrumToast, SpectrumToastValue, ToastOptions, ToastPlacement} from '../src/Toast';
import {UNSTABLE_ToastStateContext} from 'react-aria-components';
import {useToastState} from 'react-stately';

const meta: Meta<ToastStoryProps> = {
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Toast',
  argTypes: {
    timeout: {
      control: 'number'
    },
    placement: {
      control: 'radio',
      options: ['top start', 'top', 'top end', 'bottom start', 'bottom', 'bottom end']
    }
  },
  args: {
    actionLabel: 'Action!',
    shouldCloseOnAction: false,
    timeout: undefined,
    placement: 'bottom'
  }
};

export default meta;

interface ToastStoryProps extends ToastOptions {
  placement?: ToastPlacement,
  actionLabel: string
}

type Story = StoryObj<ToastStoryProps>;

export const Example: Story = {
  render: (args) => (
    <>
      <ToastContainer placement={args.placement} />
      <ButtonGroup>
        <Button
          onPress={() => ToastQueue.neutral('Toast available', {...args, onAction: action('onAction'), onClose: action('onClose')})}
          variant="secondary">
          Show Neutral Toast
        </Button>
        <Button
          onPress={() => ToastQueue.positive('Toast is done!', {...args, onAction: action('onAction'), onClose: action('onClose')})}
          variant="primary">
          Show Positive Toast
        </Button>
        <Button
          onPress={() => ToastQueue.negative('Toast is burned!', {...args, onAction: action('onAction'), onClose: action('onClose')})}
          variant="negative">
          Show Negative Toast
        </Button>
        <Button
          onPress={() => ToastQueue.info('Toasting…', {...args, onAction: action('onAction'), onClose: action('onClose')})}
          variant="accent">
          Show Info Toast
        </Button>
        <Button
          onPress={() => ToastQueue.info('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', {...args, onClose: action('onClose')})}
          variant="accent">
          Show Long Toast
        </Button>
        <Button
          onPress={() => ToastQueue.info('LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimaminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipeacommodoconsequat.', {...args, onClose: action('onClose')})}
          variant="accent">
          Show Long Word Toast
        </Button>
      </ButtonGroup>
    </>
  )
};

export const Toast: StoryObj<SpectrumToastValue> = {
  render: function Example(args) {
    return (
      <UNSTABLE_ToastStateContext.Provider value={useToastState()}>
        <SpectrumToast
          toast={{
            key: 'x',
            content: args
          }} />
      </UNSTABLE_ToastStateContext.Provider>
    );
  },
  args: {
    variant: 'info',
    children: 'Toasting…'
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['neutral', 'info', 'positive', 'negative']
    }
  }
};
