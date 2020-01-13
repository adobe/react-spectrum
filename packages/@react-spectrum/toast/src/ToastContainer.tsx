/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, useContext} from 'react';
import {Toast, ToastContext} from './';
import toastContainerStyles from './toastContainer.css';

export function ToastContainer(): ReactElement {
  let {
    toasts
  } = useContext(ToastContext);

  let renderToasts = () => {
    return toasts.map((toast) => {
      let {
        onClose,
        ...otherProps
      } = toast.props;
      return (<Toast {...otherProps} onClose={onClose} ref={toast.ref}>{toast.content}</Toast>)
    });
  };

  return (
    <div className={classNames(toastContainerStyles, 'spectrum-ToastContainer')}>
      {renderToasts()}
    </div>
  );
}
