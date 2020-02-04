import {classNames} from '@react-spectrum/utils';
import React, {ReactElement} from 'react';
import {Toast} from './';
import toastContainerStyles from './toastContainer.css';
import {ToastStateBase} from '@react-types/toast';

interface ToastProviderProps {
  toasts?: ToastStateBase[],
}

export function ToastContainer(props: ToastProviderProps): ReactElement {
  let renderToasts = () => props.toasts.map((toast) =>
    (<Toast {...toast.props}>{toast.content}</Toast>)
  );

  return (
    <div className={classNames(toastContainerStyles, 'react-spectrum-ToastContainer')}>
      {renderToasts()}
    </div>
  );
}
