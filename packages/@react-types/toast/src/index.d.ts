import {DOMProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface ToastOptions {
  actionLabel?: ReactNode,
  onAction?: () => void,
  shouldCloseOnAction?: boolean,
  onClose?: () => void,
  timeout?: number
}

interface ToastProps extends ToastOptions, DOMProps {
  variant?: String
}
