import {DOMProps, Theme} from '@react-types/shared';
import {ReactNode} from 'react';
import {StyleProps} from '@react-spectrum/view';

type ToastPlacement = 'top' | 'top left' | 'top center' | 'top right'
  | 'bottom' | 'bottom left' | 'bottom center' | 'bottom right';

export type ColorScheme = 'light' | 'dark';
export type Scale = 'medium' | 'large';

interface ContextProps {
  toastPlacement?: ToastPlacement,
  isQuiet?: boolean,
  isEmphasized?: boolean,
  isDisabled?: boolean,
  isRequired?: boolean, // ???
  isReadOnly?: boolean
}

export interface ProviderProps extends ContextProps, DOMProps, StyleProps {
  children: ReactNode,
  theme?: Theme,
  colorScheme?: ColorScheme, // by default, chooses based on OS setting
  defaultColorScheme?: ColorScheme, // if no OS setting, which to choose
  scale?: Scale, // by default, chooses based on touch/mouse
  typekitId?: string,
  locale?: string
}

export interface ProviderContext extends ContextProps {
  version: string,
  theme: Theme,
  colorScheme: ColorScheme,
  scale: Scale
}
