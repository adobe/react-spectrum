import {DOMProps, MultipleSelectionBase, Removable} from '@react-types/shared';
import {ReactChild, ReactElement} from 'react';

export interface TagProps extends DOMProps, Removable<ReactChild, void> {
  children?: ReactChild,
  icon?: ReactElement,
  isDisabled?: boolean,
  isSelected?: boolean,
  validationState?: 'invalid' | 'valid'
}

export interface TagGroupProps extends DOMProps, MultipleSelectionBase, Removable<ReactChild[], void> {
  children: ReactElement<AriaTagProps> | ReactElement<AriaTagProps>[],
  isDisabled?: boolean
  isReadOnly?: boolean,
  validationState?: 'invalid' | 'valid'
}

export interface AriaTagProps extends Removable<ReactChild, void> {
  children?: ReactChild,
  isDisabled?: boolean,
  validationState?: 'invalid' | 'valid',
  isSelected?: boolean,
  role?: string
}
