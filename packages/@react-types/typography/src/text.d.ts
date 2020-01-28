import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface TextProps extends DOMProps, StyleProps {
  children: ReactElement | ReactNode
}
