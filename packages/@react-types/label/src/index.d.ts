import {Alignment, DOMProps, LabelPosition, NecessityIndicator, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface LabelProps {
  children?: ReactNode,
  htmlFor?: string, // for compatibility with React
  for?: string
}

export interface SpectrumLabelProps extends LabelProps, DOMProps, StyleProps {
  labelPosition?: LabelPosition, // default top
  labelAlign?: Alignment, // default start
  isRequired?: boolean,
  necessityIndicator?: NecessityIndicator // default icon
}
