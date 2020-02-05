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

export interface CheckboxProps extends CheckboxBase {
  /**
   * Indeterminism is presentational, when a checkbox is indeterminate, it overrides the selection state.
   * Any subsequent click or tap will select the checkbox, and update all values as checked or unchecked.
   * The indeterminate visual representation remains, masking the checkbox value.
   */
  isIndeterminate?: boolean
}

export interface SpectrumCheckboxProps extends CheckboxProps, DOMProps, StyleProps {
  /**
   * By default, checkboxes are not emphasized (gray).
   * The emphasized (blue) version provides visual prominence.
   */
  isEmphasized?: boolean
}
