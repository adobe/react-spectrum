import {DOMProps, MultipleSelectionBase} from '@react-types/shared';

export interface ButtonGroupProps extends DOMProps, MultipleSelectionBase {
  orientation?: 'horizontal' | 'vertical',
  isDisabled?: boolean
}
