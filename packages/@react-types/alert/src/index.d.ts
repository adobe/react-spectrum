import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface AlertProps {
  title?: ReactNode,
  children: ReactNode,
  iconAlt?: string,
  'aria-live'?: 'polite' | 'off'
}

export interface SpectrumAlertProps extends AlertProps, DOMProps, StyleProps {
  variant: 'info' | 'help' | 'success' | 'error' | 'warning',
}
