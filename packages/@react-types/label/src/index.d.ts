import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface LabelProps {
  children?: ReactElement | ReactElement[],
  labelFor?: string,
  label?: ReactNode,
  htmlFor?: string
}

export interface SpectrumLabelProps extends LabelProps, DOMProps, StyleProps {
  labelPosition?: 'top' | 'side', // default top
  labelAlign?: 'start' | 'end', // default start
  isRequired?: boolean,
  necessityIndicator?: 'icon' | 'label'
}
