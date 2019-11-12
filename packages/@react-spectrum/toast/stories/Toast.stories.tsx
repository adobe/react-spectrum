import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Toast} from '../';
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
  );

function render(props:ToastProps = {}, message:String) {
  return (
    <Toast {...props}>
      {message}
    </Toast>
  );
}
