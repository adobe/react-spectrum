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
import {Button, ButtonGroup} from '../src';
import type {Meta} from '@storybook/react';
import {SpectrumToast, ToastContainer, ToastQueue} from '../src/Toast';

const meta: Meta<typeof Example> = {
  // component: Example,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  title: 'Toast',
  argTypes: {
    variant: {
      control: 'radio',
      options: ['neutral', 'info', 'positive', 'negative']
    },
    timeout: {
      control: 'number'
    },
    placement: {
      control: 'radio',
      options: ['top start', 'top', 'top end', 'bottom start', 'bottom', 'bottom end']
    }
  },
  args: {
    children: 'This is a really long toast message so that it wraps and I can test really well',
    variant: 'info',
    actionLabel: 'Action!',
    shouldCloseOnAction: false,
    timeout: null,
    placement: 'bottom'
  }
};

export default meta;

export const Example = (args: any) => (
  <>
    <ToastContainer placement={args.placement} />
    <ButtonGroup>
      <Button
        onPress={() => ToastQueue.neutral('Toast available', {...args, onClose: action('onClose')})}
        variant="secondary">
        Show Neutral Toast
      </Button>
      <Button
        onPress={() => ToastQueue.positive('Toast is done!', {...args, onClose: action('onClose')})}
        variant="primary">
        Show Positive Toast
      </Button>
      <Button
        onPress={() => ToastQueue.negative('Toast is burned!', {...args, onClose: action('onClose')})}
        variant="negative">
        Show Negative Toast
      </Button>
      <Button
        onPress={() => ToastQueue.info('Toasting…', {...args, onClose: action('onClose')})}
        variant="accent">
        Show Info Toast
      </Button>
      <Button
        onPress={() => ToastQueue.info('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.', {...args, onClose: action('onClose')})}
        variant="accent">
        Show Long Toast
      </Button>
    </ButtonGroup>
  </>
);

export const Toast = (args: any) => (
  <SpectrumToast
    toast={{
      key: 'x',
      content: args
    }} />
);
