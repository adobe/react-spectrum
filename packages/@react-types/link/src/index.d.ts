import {DOMProps, PressEvents, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface LinkProps extends PressEvents {
  children: ReactNode
}

export interface SpectrumLinkProps extends LinkProps, DOMProps, StyleProps {
  variant?: 'primary' | 'secondary' | 'overBackground',
  isQuiet?: boolean
}

export interface SpectrumLinkProps extends LinkProps, DOMProps, StyleProps {
  variant?: 'primary' | 'secondary' | 'overBackground',
  isQuiet?: boolean
}
