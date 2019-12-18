import {DOMProps, SpectrumLabelableProps, StyleProps, ValidationState} from '@react-types/shared';
import {ReactElement} from 'react';

export interface SpectrumFormProps extends DOMProps, StyleProps, SpectrumLabelableProps {
  children: ReactElement<SpectrumLabelableProps> | ReactElement<SpectrumLabelableProps>[],
  isQuiet?: boolean,
  isEmphasized?: boolean,
  isDisabled?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  validationState?: ValidationState
}
