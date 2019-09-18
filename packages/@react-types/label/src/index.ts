import {DOMProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface LabelProps extends DOMProps {
  children?: ReactElement | ReactElement[],
  labelFor?: string,
  label?: ReactNode,
  htmlFor?: string
}
