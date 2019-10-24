import {DOMProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface ToastOptions {
  actionLabel?: ReactNode,
  onAction?: (...args: any[]) => void,
  shouldCloseOnAction?: boolean,
  onClose?: (...args: any[]) => void,
  timeout?: number
}

interface ToastProps extends ToastOptions, DOMProps {
  variant?: String
}
