/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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
   * @default "bottom"
   */
  toastPlacement?: ToastPlacement,
  /** Whether children components should be displayed with the quiet style. */
  isQuiet?: boolean,
  /** Whether children components should be displayed with the emphasized style. */
  isEmphasized?: boolean,
  /** Whether children components should be disabled. */
  isDisabled?: boolean,
  /** Whether children components should be displayed with the required style. */
  isRequired?: boolean,
  /** Whether children components should be read only. */
  isReadOnly?: boolean,
  /** Whether children components should be displayed with the validation state style. */
  validationState?: ValidationState
}

export interface ProviderProps extends ContextProps, DOMProps, StyleProps {
  /** The children components to receive Provider props and context. */
  children: ReactNode,
  /**
   * Spectrum theme scoped to this provider and its children components.
   * Sets the CSS variables for scale and color scheme values.
   */
  theme?: Theme,
  /**
   * Color scheme scoped to this provider and its children components.
   * Defaults to the color scheme set by the OS/browser.
   */
  colorScheme?: ColorScheme,
  /**
   * If there is not an OS/browser color scheme this is the default.
   * @default "light"
   */
  defaultColorScheme?: ColorScheme,
  /**
   * Spectrum scale scoped to this provider and its children components.
   * By default this is selected based on touch or mouse pointer type of the OS.
   * @default "medium"
   */
  scale?: Scale,
  /**
   * Type kit ID is required and products must get their own id via
   * https://typekit.com/account/kits. The default is only intended for
   * prototyping work.
   */
  typekitId?: string,
  /**
   * Locale (language specific format) of this provider and its children.
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
