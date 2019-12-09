import {ReactElement, ReactNode} from 'react';

export interface LabelProps {
  children?: ReactElement | ReactElement[],
  labelFor?: string,
  label?: ReactNode,
  htmlFor?: string
}
