import {DOMProps} from '@react-types/shared';
import {LabelProps} from '@react-types/label';
import {ReactElement} from 'react';
import {StyleProps} from '@react-spectrum/view';

export interface FormProps extends DOMProps, StyleProps {
  children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[],
}

export interface FieldLabelBase extends LabelProps, DOMProps, StyleProps {
  labelPosition?: 'top' | 'side', // default ?
  labelAlign?: 'start' | 'end', // default start
  isRequired?: boolean,
  necessityIndicator?: 'icon' | 'label'
}

export interface FormItemProps extends FieldLabelBase {}

export interface FieldLabelProps extends FieldLabelBase {}
