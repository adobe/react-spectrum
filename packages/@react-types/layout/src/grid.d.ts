import {DOMProps, GridStyleProps} from '@react-types/shared';
import {ReactElement} from 'react';

export interface GridProps extends DOMProps, GridStyleProps {
  children: ReactElement | ReactElement[],
  slots: {[key: string]: string}
}
