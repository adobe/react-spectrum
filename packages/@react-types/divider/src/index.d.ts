import {DOMProps, StyleProps} from '@react-types/shared';

export interface SpectrumDividerProps extends DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  orientation?: 'horizontal' | 'vertical',
  slot?: string
}
