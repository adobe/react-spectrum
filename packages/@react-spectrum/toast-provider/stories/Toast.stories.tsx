import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Toast} from '@react-spectrum/toast';
import {ToastProps} from '@react-types/toast';
import {useToastProvider} from '@react-spectrum/toast-provider';

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
        variant="cta">
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
        variant="secondary">
          Show info Toast
      </Button>
    </div>
  );
}
