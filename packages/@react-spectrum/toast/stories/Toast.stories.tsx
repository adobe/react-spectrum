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
  ).add(
    'add via provider with timers',
    () => <RenderProviderTimers />
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

function RenderProviderTimers() {
  let toastContext = useToastProvider();

  return (
    <div>
      <Button
        onPress={() => toastContext.neutral('Toast defaults to 5 second timeout', {onClose: action('onClose')})}
        variant="secondary">
          Show Default Toast
      </Button>
      <Button
        onPress={() => toastContext.neutral('Actionable Toast defaults to no timeout', {onClose: action('onClose'), actionLabel: 'no timeout'})}
        variant="secondary">
          Show Actionable Toast
      </Button>
      <Button
        onPress={() => toastContext.neutral('Toast has a 7 second timeout', {onClose: action('onClose'), timeout: 7000})}
        variant="secondary">
          Show 7 Second Timeout Toast
      </Button>
      <Button
        onPress={() => toastContext.neutral('Toast with "timeout=0" has no timeout', {onClose: action('onClose'), timeout: 0})}
        variant="secondary">
          Show No Timeout Toast
      </Button>
    </div>
  );
}
