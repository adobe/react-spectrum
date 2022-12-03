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

import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Heading} from '@react-spectrum/text';
import React from 'react';
import {SpectrumToastOptions} from '../src/ToastProvider';
import {storiesOf} from '@storybook/react';
import {ToastProvider, useToastProvider} from '../';

// TODO: dialog stories with toasts, make toast go to top provider

storiesOf('Toast', module)
  .addParameters({
    args: {
      shouldCloseOnAction: false,
      timeout: null
    },
    argTypes: {
      timeout: {
        control: {
          type: 'radio',
          options: [null, 5000]
        }
      }
    }
  })
  .add(
    'Default',
    args => <ToastProvider><RenderProvider {...args} /></ToastProvider>
  )
  .add(
    'With action',
    args => <ToastProvider><RenderProvider {...args} actionLabel="Action" onAction={action('onAction')} /></ToastProvider>
  )
  .add(
    'With dialog',
    args => (
      <ToastProvider>
        <DialogTrigger isDismissable>
          <Button variant="accent">Open dialog</Button>
          <Dialog>
            <Heading>Toasty</Heading>
            <Content>
              <RenderProvider {...args} />
            </Content>
          </Dialog>
        </DialogTrigger>
      </ToastProvider>
    )
  )
  .add(
    'nested ToastProvider',
    args => (
      <ToastProvider>
        <div>
          <div>
            <h2>Outer</h2>
            <RenderProvider {...args} />
          </div>
          <ToastProvider>
            <div>
              <h2>Inner</h2>
              <RenderProvider {...args} />
            </div>
          </ToastProvider>
        </div>
      </ToastProvider>
    )
  );

function RenderProvider(options: SpectrumToastOptions) {
  let toastContext = useToastProvider();

  return (
    <ButtonGroup>
      <Button
        onPress={() => toastContext.neutral('Toast available', {...options, onClose: action('onClose')})}
        variant="secondary">
        Show Default Toast
      </Button>
      <Button
        onPress={() => toastContext.positive('Toast is done!', {...options, onClose: action('onClose')})}
        variant="primary">
        Show Primary Toast
      </Button>
      <Button
        onPress={() => toastContext.negative('Toast is burned!', {...options, onClose: action('onClose')})}
        variant="negative">
        Show Negative Toast
      </Button>
      <Button
        onPress={() => toastContext.info('Toasting…', {...options, onClose: action('onClose')})}
        variant="accent"
        style="outline">
        Show info Toast
      </Button>
    </ButtonGroup>
  );
}
