import type {ReactNode} from 'react';
import type {NativeTheme} from '../theme/types';

export type ColorScheme = 'light' | 'dark';
export type Scale = 'medium' | 'large';
export type Direction = 'ltr' | 'rtl';

export interface NativeProviderContext {
  colorScheme: ColorScheme;
  direction: Direction;
  isDisabled?: boolean;
  isEmphasized?: boolean;
  isQuiet?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  locale?: string;
  scale: Scale;
  theme: NativeTheme;
  validationState?: 'valid' | 'invalid';
}

export interface NativeProviderProps extends Partial<NativeProviderContext> {
  children?: ReactNode;
}

export type ProviderDefaultProp =
  | 'isDisabled'
  | 'isEmphasized'
  | 'isQuiet'
  | 'isReadOnly'
  | 'isRequired'
  | 'validationState';
