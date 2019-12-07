import {DOMProps} from '@react-types/shared';
import {LabelProps} from '@react-types/label';
import {ReactElement, ReactNode} from 'react';
import {StyleProps} from '@react-spectrum/view';

export interface FormProps extends DOMProps, StyleProps {
  children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[],
}

export interface FieldLabelBase extends LabelProps, DOMProps, StyleProps {
  labelPosition?: 'top' | 'side',
  labelAlign?: 'start' | 'end', // default start
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
