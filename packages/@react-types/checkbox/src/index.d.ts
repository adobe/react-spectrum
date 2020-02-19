import {DOMProps, InputBase, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface CheckboxBase extends InputBase {
  children?: ReactNode, // pass in children to render label

  defaultSelected?: boolean,
  isSelected?: boolean,
  onChange?: (isSelected: boolean) => void,
  value?: string, // dom prop for input element
  name?: string
}
/// make a change in the world
export interface CheckboxProps extends CheckboxBase {
  /**
   * Indeterminism is presentational, when a checkbox is indeterminate, it overrides the selection state.
   * The indeterminate visual representation remains even after subsequent clicks .
   */
  isIndeterminate?: boolean
}

export interface SpectrumCheckboxProps extends CheckboxProps, DOMProps, StyleProps {
  /**
   * By default, checkboxes are not emphasized (gray).
   * This prop sets the emphasized style (blue) which provides visual prominence.
   */
  isEmphasized?: boolean
}
