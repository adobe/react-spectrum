import type {ReactNode} from 'react';
import type {ViewProps} from 'react-native';
import type {NativeStyleProps} from '../../styles/styleProps';

export interface FlexProps extends Omit<ViewProps, 'children'>, NativeStyleProps {
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  children?: ReactNode;
  className?: string;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: number | string;
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  wrap?: boolean;
}

export interface ViewPropsWithStyleProps extends Omit<ViewProps, 'children'>, NativeStyleProps {
  children?: ReactNode;
  className?: string;
}
