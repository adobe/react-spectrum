import {DOMProps} from '@react-types/shared';
import {ReactElement} from 'react';

export interface LinkProps extends DOMProps {
  children: string | ReactElement,
  className?: string
}
