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
import React, {ReactElement, ReactNode, useContext} from 'react';
import styles from '@adobe/spectrum-css-temp/components/toast/vars.css';
import {Toast} from './';
import {ToastOptions} from '@react-types/toast';
import {useProviderProps} from '@react-spectrum/provider';
// import {useToast} from '@react-aria/toast';

interface ToastContainerContextProps {
  addChildren: (child: ReactNode) => {}
}

export const ToastContainerContext = React.createContext<ToastContainerContextProps | null>(null);

export function useToastProvider(): ToastContainerContext {
  return useContext(ToastContainerContext);
}

export function ToastContainer(props: ToastOptions): ReactElement {
  let defaults = {};
  let completeProps = Object.assign({}, defaults, useProviderProps(props));
  // let {toastProps} = useToast(completeProps);
  let {
    children
  } = completeProps;
  // let toastContext = useToastProvider();


  let addChildren = (child) => {
    console.log('child', child);
    children.add(child);
  };

  return (
    <div className={classNames(styles, 'spectrum-Toast')}>
      <ToastContainerContext.Provider value={{addChildren}}>
        <div>See me</div>
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

export function positive(content: ReactNode, options: ToastOptions, toastContext): void {
  // addToast(<Toast variant="positive" {...options}>{message}</Toast>, options.timeout, options.container);
  addToast(<Toast variant="positive" {...options}>{content}</Toast>, options.timeout, toastContext);
}
