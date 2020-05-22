import {DOMProps, Orientation} from '@react-types/shared';
import {ReactElement} from 'react';

export interface SplitViewProps extends DOMProps {
  children: [ReactElement, ReactElement],
  orientation?: Orientation,
  allowsResizing?: boolean,
  allowsCollapsing?: boolean,
  onResize?: (primarySize: number) => void,
  onResizeEnd?: (primarySize: number) => void,
  primaryPane?: 0 | 1,
  primarySize?: number,
  defaultPrimarySize?: number,
  primaryMinSize?: number,
  primaryMaxSize?: number,
  secondaryMinSize?: number,
  secondaryMaxSize?: number
}
