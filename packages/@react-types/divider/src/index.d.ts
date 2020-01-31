import {DOMProps, Orientation, StyleProps} from '@react-types/shared';

export interface SpectrumDividerProps extends DOMProps, StyleProps {
  /**
   * How thick the Divider should be.
   * @default 'L'
   */
  size?: 'S' | 'M' | 'L',

  /**
   * The axis the Divider should align with.
   * @default 'horizontal'
   */
  orientation?: Orientation
}
