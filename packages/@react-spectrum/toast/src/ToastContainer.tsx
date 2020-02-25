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
  let renderToasts = () => toasts.map((toast) =>
    (<Toast key={toast.props.idKey} {...toast.props} onRemove={onRemove}>{toast.content}</Toast>)
  );
  let providerProps = useProvider();
  let [containerPosition, containerPlacement] = providerProps.toastPlacement.split(' ');

  return (
    <div className={classNames(toastContainerStyles, 'react-spectrum-ToastContainer', `react-spectrum-ToastContainer--${containerPosition}`)}>
      {renderToasts()}
    </div>
  );
}
