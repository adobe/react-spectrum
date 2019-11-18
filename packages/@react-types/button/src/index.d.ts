import {DOMProps, MultipleSelectionBase} from '@react-types/shared';
import {ReactNode} from 'react';

export interface ButtonGroupBase extends DOMProps, MultipleSelectionBase {
  orientation?: 'horizontal' | 'vertical',
  isDisabled?: boolean
}