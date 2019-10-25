import {DOMProps} from '@react-types/shared';
import {LabelProps} from '@react-types/label';
import {ReactElement, ReactNode} from 'react';

export interface FormProps extends DOMProps {
  children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[],
}

export interface FieldLabelBase extends LabelProps {
  labelPosition?: 'top' | 'side',
  labelAlign?: 'start' | 'end',
  isRequired?: boolean,
  necessityIndicator?: 'icon' | 'label',
  children?: ReactElement | ReactElement[],
  labelFor?: string,
  label?: ReactNode,
  htmlFor?: string
}

export interface FormItemProps extends FieldLabelBase {}


export interface FieldLabelProps extends FieldLabelBase {
}
