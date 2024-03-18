import {ReactNode, createContext} from 'react';
import {ContextValue, SlotProps} from 'react-aria-components';
import {StyleProps, UnsafeStyles} from './style-utils' with {type: 'macro'};
import {StyleString} from '../style-macro/types';
import {AriaLabelingProps, DOMProps} from '@react-types/shared';

export interface IconProps extends StyleProps, SlotProps, AriaLabelingProps, DOMProps {
  'aria-hidden'?: boolean | 'false' | 'true'
}

export interface IconContextValue extends UnsafeStyles, SlotProps {
  css?: StyleString,
  render?: (icon: ReactNode) => ReactNode
}

export const IconContext = createContext<ContextValue<IconContextValue, SVGElement>>({});
