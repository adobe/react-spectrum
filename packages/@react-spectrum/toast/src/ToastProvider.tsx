import React, {createRef, ReactElement, ReactNode, useContext} from 'react';
import {ToastContainer} from './';
import {ToastOptions, ToastStateBase} from '@react-types/toast';
import {useProviderProps} from '@react-spectrum/provider';
import {useToastState} from '@react-stately/toast';

interface ToastContextProps {
  setToasts?: (any) => void,
  toasts?: ToastStateBase[],
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
  let {onAdd, onRemove, toasts} = useToastState();
  let {
    children
  } = useProviderProps(props);

  let contextValue = {
    neutral: (content: ReactNode, options: ToastOptions = {}) => {
      onAdd(content, {...options});
    },
    positive: (content: ReactNode, options: ToastOptions = {}) => {
      onAdd(content, {...options, variant: 'positive'});
    },
    negative: (content: ReactNode, options: ToastOptions = {}) => {
      onAdd(content, {...options, variant: 'negative'});
    },
    info: (content: ReactNode, options: ToastOptions = {}) => {
      onAdd(content, {...options, variant: 'info'});
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastContainer toasts={toasts} onRemove={onRemove} />
      {children}
    </ToastContext.Provider>
  );
}
