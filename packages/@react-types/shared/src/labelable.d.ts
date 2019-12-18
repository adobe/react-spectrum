import {ReactNode} from 'react';

export type LabelPosition = 'top' | 'side';
export type Alignment = 'start' | 'end';
export type NecessityIndicator = 'icon' | 'label';

export interface LabelableProps {
  label?: ReactNode,
  isRequired?: boolean
}

export interface SpectrumLabelableProps extends LabelableProps {
  labelPosition?: LabelPosition,
  labelAlign?: Alignment,
  necessityIndicator?: NecessityIndicator
}
