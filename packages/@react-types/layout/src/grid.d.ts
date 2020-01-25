import {DOMProps, GridStyleProps} from '@react-types/shared';
import {ReactElement, ReactNodeArray} from 'react';

export interface GridProps extends DOMProps, GridStyleProps {
  children: ReactElement | ReactElement[] | ReactNodeArray,
  slots: {[key: string]: string}
}
