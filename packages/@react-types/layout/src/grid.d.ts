import {DOMProps, GridStyleProps} from '@react-types/shared';
import {ReactElement} from 'react';

export type Slots = {[key: string]: string};

export interface GridProps extends DOMProps, GridStyleProps {
  children: ReactElement | ReactElement[],
  slots: Slots
}
