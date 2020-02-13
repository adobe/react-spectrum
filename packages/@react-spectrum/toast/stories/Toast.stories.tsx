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
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Toast} from '../';
import {ToastProps} from '@react-types/toast';
import {useToastProvider} from '../';

storiesOf('Toast', module)
  .add(
    'Default',
    () => render({onClose: action('onClose')}, 'Toast is done.')
  )
  .add(
    'variant = info',
    () => render({variant: 'info', onClose: action('onClose')}, 'Toast is happening.')
  )
  .add(
    'variant = positive',
    () => render({variant: 'positive', onClose: action('onClose')}, 'Toast is perfect.')
  )
  .add(
    'variant = Negative',
    () => render({variant: 'negative', onClose: action('onClose')}, 'Toast is not done.')
  )
  .add(
    'actionable',
      () => render({actionLabel: 'Undo', onAction: action('onAction'), onClose: action('onClose')}, 'Untoast the toast')
  )
  .add(
    'action triggers close',
    () => render({actionLabel: 'Undo', onAction: action('onAction'), shouldCloseOnAction: true, onClose: action('onClose')}, 'Close on untoasting of the toast')
  ).add(
    'add via provider',
    () => <RenderProvider />
  );

function render(props:ToastProps = {}, message:String) {
  return (
    <Toast {...props}>
      {message}
    </Toast>
  );
}

function RenderProvider() {
  let toastContext = useToastProvider();

  return (
    <div>
      <Button
        onPress={() => toastContext.neutral('Toast is default', {onClose: action('onClose')})}
        variant="secondary">
          Show Default Toast
      </Button>
      <Button
        onPress={() => toastContext.positive('Toast is positive', {onClose: action('onClose')})}
        variant="primary">
          Show Primary Toast
      </Button>
      <Button
        onPress={() => toastContext.negative('Toast is negative', {onClose: action('onClose')})}
        variant="negative">
          Show Negative Toast
      </Button>
      <Button
        onPress={() => toastContext.info('Toast is info', {onClose: action('onClose')})}
        variant="cta">
          Show info Toast
      </Button>
    </div>
  );
}
