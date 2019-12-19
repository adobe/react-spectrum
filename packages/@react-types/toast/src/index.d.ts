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
  variant?: 'positive' | 'negative' | 'info' // TODO: move this into react-spectrum
}

export interface SpectrumToastProps extends ToastProps, DOMProps, StyleProps {}
