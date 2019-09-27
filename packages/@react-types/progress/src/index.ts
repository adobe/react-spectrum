import {DOMProps} from '@react-types/shared';

export interface ProgressCircleProps extends DOMProps {
  value?: number,
  size?: 'S' | 'M' | 'L',
  variant?: 'overBackground',
  isCentered?: boolean,
  isIndeterminate?: boolean
}
