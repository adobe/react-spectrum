import {CheckboxBase} from '@react-types/checkbox';
import {DOMProps, StyleProps} from '@react-types/shared';

export type SwitchProps = CheckboxBase;
export interface SpectrumSwitchProps extends SwitchProps, DOMProps, StyleProps {
  isEmphasized?: boolean
}
