import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface ToastOptions {
  actionLabel?: ReactNode,
  onAction?: (...args: any[]) => void,
  shouldCloseOnAction?: boolean,
  onClose?: (...args: any[]) => void,
  timeout?: number
}

interface ToastProps extends ToastOptions {
  children?: ReactNode,
  variant?: 'positive' | 'negative' | 'info'
}

export interface SpectrumToastProps extends ToastProps, DOMProps, StyleProps {}

export interface ToastStateBase {
  content: ReactNode,
  props: ToastOptions/*,
  ref: any*/
}
