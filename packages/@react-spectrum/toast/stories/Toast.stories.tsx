import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import React, {useContext, useRef, useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Toast} from '../';
import {ToastContainer, useToastProvider} from '../';
import {ToastProps} from '@react-types/toast';

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
  )
  .add(
    'action triggers close',
    () => render({actionLabel: 'Undo', onAction: action('onAction'), shouldCloseOnAction: true, onClose: action('onClose')}, 'Close on untoasting of the toast')
  )
  .add(
    'add positive',
    () => {
      return (
          <RenderPositive />
      );
    }
  );

function render(props:ToastProps = {}, message:String) {
  return (
    <Toast {...props}>
      {message}
    </Toast>
  );
}



function RenderPositive() {
  let toastContext = useToastProvider();

  return (
    <div>
        <Button
          onPress={() => toastContext.positive('Toast is positive', {onClose: action('onClose')})}
          variant="primary">
            Show Toast
        </Button>
    </div>
  );

}
