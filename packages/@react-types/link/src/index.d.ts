import {PressProps} from '@react-aria/interactions';
import {ReactNode} from 'react';

export interface LinkProps extends PressProps {
  children: ReactNode
}
