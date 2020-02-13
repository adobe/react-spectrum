import {DOMProps, StyleProps, ValidationState} from '@react-types/shared';
import {ReactNode} from 'react';

type ToastPlacement = 'top' | 'top left' | 'top center' | 'top right'
  | 'bottom' | 'bottom left' | 'bottom center' | 'bottom right';

export type ColorScheme = 'light' | 'dark';
export type Scale = 'medium' | 'large';

export interface CSSModule {
  [className: string]: string
}

export interface Theme {
  global?: CSSModule,
  light?: CSSModule,
  dark?: CSSModule,
  medium?: CSSModule,
  large?: CSSModule
}

interface ContextProps {
  /**
   * Set the placement of the toast alerts for the provider.
   * default "bottom"
   */
  toastPlacement?: ToastPlacement,
  /** Sets quiet property for children components that use this property via context. Sets the quiet style. */
  isQuiet?: boolean,
  /** Sets emphasized property for children component that use this property via context. Sets the quiet style. */
  isEmphasized?: boolean,
  /** Sets disabled property for children component that use this property via context. Disables the component. */
  isDisabled?: boolean,
  /** Sets required property for children component that use this property via context. Sets the required style. */
  isRequired?: boolean,
  /** Sets read only property for children component that use this property via context. Component is read only. */
  isReadOnly?: boolean,
  /** Sets validation state property for children component that use this property via context. Sets the validation state style. */
  validationState?: ValidationState
}

export interface ProviderProps extends ContextProps, DOMProps, StyleProps {
  /** The components to receive provider properties and context. */
  children: ReactNode,
  /**
   * Spectrum theme scoped to this provider and it's children components.
   * @default "light"
   */
  theme?: Theme,
  /**
   * Color scheme scoped to this provider and it's children components.
   * Defaults to the color scheme set by the OS.
   */
  colorScheme?: ColorScheme,
  /** If there is not an OS color scheme this is the default. */
  defaultColorScheme?: ColorScheme,
  /**
   * Spectrum scale scoped to this provider and it's children components.
   * By default this is selected based on touch or mouse pointer type of the OS.
   * @default "medium"
   */
  scale?: Scale,
  /**
   * Type kit ID. This is required and products must get their own id's.
   * https://typekit.com/account/kits There is a default provided, but
   * it's only intended for prototyping work.
   */
  typekitId?: string,
  /**
   * Locale (language specific format) of this provider and it's children.
   * Using the format primary-region, ex. en-US, fr-CA, ar-AE.
   * @default "en-US"
   */
  locale?: string
}

export interface ProviderContext extends ContextProps {
  version: string,
  theme: Theme,
  colorScheme: ColorScheme,
  scale: Scale
}
