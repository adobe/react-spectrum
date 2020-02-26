import {classNames} from '@react-spectrum/utils';
import React, {ReactElement} from 'react';
import {Toast} from './';
import toastContainerStyles from './toastContainer.css';
import {ToastState} from '@react-types/toast';
import {useProvider} from '@react-spectrum/provider';

export function ToastContainer(props: ToastState): ReactElement {
  let {
    onRemove,
    toasts
  } = props;
  let providerProps = useProvider();
  let toastPlacement = providerProps && providerProps.toastPlacement && providerProps.toastPlacement.split(' ');
  let containerPosition = toastPlacement && toastPlacement[0];
  let containerPlacement = toastPlacement && toastPlacement[1];

  let renderToasts = () => toasts.map((toast) =>
    (<Toast key={toast.props.idKey} {...toast.props} onRemove={onRemove}>{toast.content}</Toast>)
  );


  return (
    <div
      className={classNames(
        toastContainerStyles,
        'react-spectrum-ToastContainer',
        containerPosition && `react-spectrum-ToastContainer--${containerPosition}`,
        containerPlacement && `react-spectrum-ToastContainer--${containerPlacement}`
      )}>
      {renderToasts()}
    </div>
  );
}
