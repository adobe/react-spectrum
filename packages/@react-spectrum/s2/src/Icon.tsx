import {ReactNode, createContext} from 'react';
import {ContextValue, SlotProps} from 'react-aria-components';
import {UnsafeStyles} from './style-utils' with {type: 'macro'};
import {StyleString} from '../style/types';
import {AriaLabelingProps, DOMProps} from '@react-types/shared';

export interface IconProps extends UnsafeStyles, SlotProps, AriaLabelingProps, DOMProps {
  'aria-hidden'?: boolean | 'false' | 'true'
}

export interface IconContextValue extends UnsafeStyles, SlotProps {
  styles?: StyleString,
  render?: (icon: ReactNode) => ReactNode
}

export const IconContext = createContext<ContextValue<IconContextValue, SVGElement>>({});
