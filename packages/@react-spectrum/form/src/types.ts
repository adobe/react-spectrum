import {DOMProps} from '@react-types/shared';
import {LabelProps} from '@react-types/label';
import {ReactElement} from 'react';

export interface FormProps extends DOMProps {
  children: ReactElement<FormItemProps> | ReactElement<FormItemProps>[],
}

export interface FieldLabelBase {
  labelPosition?: 'top' | 'side',
  labelAlign: 'start' | 'end',
  isRequired: boolean,
  necessityIndicator?: 'icon' | 'label',
}

export interface FormItemProps extends FieldLabelBase, LabelProps {}
