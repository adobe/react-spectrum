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
import {Toast} from './';
import {ToastOptions} from '@react-types/toast';
import {useProviderProps} from '@react-spectrum/provider';
// import {useToast} from '@react-aria/toast';

interface ToastContainerContextProps {
  setMessage?: (any) => {}
  positive?: (any) => {}
}

export const ToastContainerContext = React.createContext<ToastContainerContextProps | null>();

export function ToastContainer(props: ToastOptions): ReactElement {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  // let {toastProps} = useToast(completeProps);
  let [toast, setToast] = useState();
  // console.log('setMessage', setMessage);
  let {
    children
  } = completeProps;
  // let toastContext = useToastProvider();

  let renderToasts = () => {
    return (<Toast {...toast.props}>{toast.message}</Toast>);
  };

  let contextValue = {
    positive: (message, props) =>
      setToast({
        message,
        props: {...props, variant: 'positive'}
      })
  }

  return (
    <div className={classNames(styles, 'spectrum-Toast')}>
      <ToastContainerContext.Provider value={contextValue}>
        {toast && renderToasts()}
        {children}
      </ToastContainerContext.Provider>
    </div>
  );
}

function addToast(toast, timeout, toastContext) {
  console.log('addToast', toast);
  // let toastContext = useToastProvider();
  toastContext.addChildren(toast);
  /* return (
    <ToastContainerContext.Consumer>
      {({addChildren}) => {
        console.log('addChildren', addChildren);
        addChildren(toast);
        return (<div>boo</div>);
      }}
    </ToastContainerContext.Consumer>
  );*/
}

export function usePositive(content: ReactNode, options: ToastOptions): void {
  // addToast(<Toast variant="positive" {...options}>{message}</Toast>, options.timeout, options.container);
  let toastContext = useContext(ToastContainerContext);
  toastContext.positive(content);
}
