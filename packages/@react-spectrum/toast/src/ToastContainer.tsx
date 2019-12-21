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

import {chain} from '@react-aria/utils';
import {classNames} from '@react-spectrum/utils';
import React, {ReactElement, ReactNode, useContext, useMemo, useState} from 'react';
// import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
import {Toast, ToastContext} from './';
import toastContainerStyles from './toastContainer.css';
import {ToastOptions} from '@react-types/toast';
import {useProviderProps} from '@react-spectrum/provider';
// import {useToast} from '@react-aria/toast';

export function ToastContainer(props: ToastOptions): ReactElement {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  // let {toastProps} = useToast(completeProps);
  let {
    children
  } = completeProps;
  let {
    toasts,
    setToasts,
  } = useContext(ToastContext);

  /* let removeToast = (toastRef, e) => {
    console.log('toastRef', toastRef);
    console.log('toasts before', toasts.length);
    let filtered = toasts.filter(t => {
      console.log('t.ref.current.id', t.ref.current.id);
      console.log('toastRef.current.id', toastRef.current.id);
      return t.ref.current.id !== toastRef.current.id;
    });

    console.log('toasts after', toasts.length);
    console.log('filtered after', filtered.length);
    setToasts(filtered);
  };*/


  let renderToasts = () => {
    console.log('toasts.length', toasts.length);
    return toasts.map((toast) => {
      let {
        onClose,
        ...otherProps
      } = toast.props;
      console.log('toast.ref', toast.ref);
      return (<Toast {...otherProps} onClose={onClose} ref={toast.ref}>{toast.content}</Toast>)
      // return (<Toast {...otherProps} onClose={chain(onClose, (e) => removeToast(toast.ref, e))} ref={toast.ref}>{toast.content}</Toast>)
    });
  };

  return (
    <div className={classNames(toastContainerStyles, 'spectrum-ToastContainer')}>
      {renderToasts()}
    </div>
  );
}
