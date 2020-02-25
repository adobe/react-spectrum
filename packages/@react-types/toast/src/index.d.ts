import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface ToastOptions extends DOMProps {
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

export interface SpectrumToastProps extends ToastProps, ToastState, StyleProps {
  idKey?: string,
}

export interface ToastState {
  onAdd?: (content: ReactNode, options: SpectrumToastProps) => void,
  onRemove?: (idKey: string) => void,
  setToasts?: (value: ToastStateValue[]) => void,
  toasts?: ToastStateValue[]
}

export interface ToastStateValue{
  content: ReactNode,
  props: SpectrumToastProps,
  timeoutId: ReturnType<typeof setTimeout>
}
