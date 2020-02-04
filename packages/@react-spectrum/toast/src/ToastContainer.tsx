import {classNames} from '@react-spectrum/utils';
import React, {ReactElement} from 'react';
import {Toast} from './';
import toastContainerStyles from './toastContainer.css';
import {ToastStateProp} from '@react-types/toast';

interface ToastProviderProps {
  toasts?: ToastStateProp[],
}

export function ToastContainer(props: ToastProviderProps): ReactElement {
  let renderToasts = () => props.toasts.map((toast) => {
    return (<Toast {...toast.props} ref={toast.ref}>{toast.content}</Toast>);
  });

  return (
    <div className={classNames(toastContainerStyles, 'react-spectrum-ToastContainer')}>
      {renderToasts()}
    </div>
  );
}
