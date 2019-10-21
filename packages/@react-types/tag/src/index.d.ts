import {DOMProps, MultipleSelectionBase, Removable} from '@react-types/shared';
import {ReactChild, ReactElement} from 'react';

export interface TagProps extends DOMProps, Removable<ReactChild, void> {
  children?: ReactChild,
  icon?: ReactElement,
  isDisabled?: boolean,
  validationState?: 'invalid' | 'valid'
}

export interface TagGroupProps extends DOMProps, MultipleSelectionBase {
  children: ReactElement<AriaTagProps> | ReactElement<AriaTagProps>[],
  isDisabled?: boolean
}

export interface AriaTagProps extends Removable<ReactChild, void> {
  children?: ReactChild,
  isDisabled?: boolean,
  isSelected?: boolean,
  role?: string
}
