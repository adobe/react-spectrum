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
import React, {ReactElement, ReactNode, useContext, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
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
    toasts
  } = useContext(ToastContext);


  let renderToasts = () => {
    return toasts.map((toast) =>
     (<Toast {...toast.props}>{toast.content}</Toast>)
   );
  };

  return (
    <div className={classNames(toastContainerStyles, 'spectrum-ToastContainer')}>
      {toasts && renderToasts()}
    </div>
  );
}
