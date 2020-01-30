import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface KeyboardProps extends DOMProps, StyleProps {
  children: ReactElement | ReactNode
}
