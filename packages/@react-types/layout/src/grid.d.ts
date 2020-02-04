import {DOMProps, GridStyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export type Slots = {[key: string]: string};

export interface GridProps extends DOMProps, GridStyleProps {
  children: ReactNode,
  slots: Slots
}
