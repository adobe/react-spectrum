import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, useContext} from 'react';
import {Toast, ToastContext} from './';
import toastContainerStyles from './toastContainer.css';

export function ToastContainer(): ReactElement {
  let {
    toasts
  } = useContext(ToastContext);

  let renderToasts = () => toasts.map((toast) => {
    let {
      onClose,
      ...otherProps
    } = toast.props;
    return (<Toast {...otherProps} onClose={onClose} ref={toast.ref}>{toast.content}</Toast>);
  });

  return (
    <div className={classNames(toastContainerStyles, 'spectrum-ToastContainer')}>
      {renderToasts()}
    </div>
  );
}
