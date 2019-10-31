import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import React, {useContext} from 'react';
import {storiesOf} from '@storybook/react';
import {Toast} from '../';
import {positive, ToastContainerContext, useToastProvider} from '../';
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
    () => renderPositive()
  );

function render(props:ToastProps = {}, message:String) {
  return (
    <Toast {...props}>
      {message}
    </Toast>
  );
}

function renderPositive() {
  let toastContext = useContext(ToastContainerContext);
  let containerRef = React.useRef();
  let Blah = React.forwardRef((props, ref) => {
    console.log('props.toast', props.toast);
    return (
      <div ref={ref}>
         {props.toast}
      </div>
    )
  });
  return (
    <div>
      <Blah ref={containerRef}></Blah>
      <Button
        onPress={() => {
          // positive('Toast is perfect.', {}, toastContext);
          function addToast(content) {
            console.log('ref?', containerRef.current.toast);
            console.log('toast?', () => {return content});
            containerRef.current.toast = () => {return content};
          };
          console.log('pressed');
          addToast(<Toast variant="positive">Toast is perfect</Toast>);
        }}
        variant="primary">
          Show Toast
      </Button>
    </div>
  );

}
