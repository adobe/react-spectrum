import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactElement} from 'react';

export interface HeadingProps extends DOMProps, StyleProps {
  children: ReactElement | string
}
