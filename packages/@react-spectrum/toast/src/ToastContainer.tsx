import {classNames} from '@react-spectrum/utils';
import React, {ReactElement} from 'react';
import {Toast} from './';
import toastContainerStyles from './toastContainer.css';
import {ToastState} from '@react-types/toast';

export function ToastContainer(props: ToastState): ReactElement {
  let {
    onRemove,
    toasts
  } = props;
  let renderToasts = () => toasts.map((toast) =>
    (<Toast {...toast.props} onRemove={onRemove}>{toast.content}</Toast>)
  );

  return (
    <div className={classNames(toastContainerStyles, 'react-spectrum-ToastContainer')}>
      {renderToasts()}
    </div>
  );
}
