import {DOMProps, MultipleSelection} from '@react-types/shared';

export interface ButtonGroupProps extends DOMProps, MultipleSelection {
  orientation?: 'horizontal' | 'vertical',
  isDisabled?: boolean
}
