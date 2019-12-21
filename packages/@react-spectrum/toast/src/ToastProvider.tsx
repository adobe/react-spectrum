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
import React, {createRef, ReactElement, ReactNode, useContext} from 'react';
import {ToastContainer} from './';
import {ToastOptions} from '@react-types/toast';
import {useProviderProps} from '@react-spectrum/provider';
import {useToastState} from '@react-stately/toast';

interface ToastContextProps {
  setToasts?: (any) => void,
  toasts?: {content: ReactNode, props: ToastOptions, ref: any}[],
  positive?: (content: ReactNode, options: ToastOptions) => void,
  negative?: (content: ReactNode, options: ToastOptions) => void,
  neutral?: (content: ReactNode, options: ToastOptions) => void,
  info?: (content: ReactNode, options: ToastOptions) => void
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastContext = React.createContext<ToastContextProps | null>(null);

export function useToastProvider() {
  return useContext(ToastContext);
}

export function ToastProvider(props: ToastProviderProps): ReactElement {
  let {onAdd, onRemove, toasts, setToasts} = useToastState([]);
  let {
    children
  } = useProviderProps(props);

  // useMemo(() => fn, deps)
  // let removeToast = useMemo((toastRef, e) => {
  /* let removeToast = (toastRef) => {
    remove(toastRef);
  };

  let remove = (toastRef) => {
    console.log('toastRef', toastRef);
    console.log('toasts before', toasts.length);
    let filtered = toasts.filter(t => t.ref.current.id !== toastRef.current);

    console.log('filtered after', filtered.length);
    console.log('toasts after', toasts.length);
    setToasts(filtered);
  };*/

  let contextValue = {
    toasts,
    setToasts,
    positive: (content: ReactNode, options: ToastOptions = {}) => {
      onAdd(content, options);
      /* let tempToasts = [...toasts];
      let {
        timeout,
        ...otherProps
      } = options;
      let toastRef = createRef();
      console.log('toastRef', toastRef);

      otherProps.onClose = chain(otherProps.onClose, () => onRemove(toastRef));

      tempToasts.push({
        content,
        props: {
          variant: 'positive',
          ...otherProps
        },
        ref: toastRef
      });
      console.log('tempToasts', tempToasts);
      setToasts(tempToasts);*/
    }
  }

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastContainer />
      {children}
    </ToastContext.Provider>
  );
}
