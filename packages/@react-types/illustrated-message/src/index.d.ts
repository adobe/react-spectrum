import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface SpectrumIllustratedMessageProps extends DOMProps, StyleProps {
  heading?: string,
  description?: ReactNode,
  illustration?: ReactElement,
  ariaLevel?: number
}
