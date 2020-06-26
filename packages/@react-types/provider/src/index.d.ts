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

export type CSSModule = {
  [className: string]: string
};

/** A theme object defines CSS variables for a theme, across multiple color schemes and scales. */
export interface Theme {
  /** CSS module defining the global variables, which do not change between color schemes/scales. */
  global?: CSSModule,
  /** CSS module defining the variables for the light color scheme. */
  light?: CSSModule,
  /** CSS module defining the variables for the dark color scheme. */
  dark?: CSSModule,
  /** CSS module defining the variables for the medium scale. */
  medium?: CSSModule,
  /** CSS module defining the variables for the large scale. */
  large?: CSSModule
}

interface ContextProps {
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
   * Theme scoped to this provider and its children components.
   * Sets the CSS variables for scale and color scheme values.
   */
  theme?: Theme,
  /**
   * Color scheme scoped to this provider and its children components.
   * Defaults to the color scheme set by the OS.
   */
  colorScheme?: ColorScheme,
  /**
   * If there is not an OS/browser color scheme this is the default.
   * @default 'light'
   */
  defaultColorScheme?: ColorScheme,
  /**
   * Spectrum scale scoped to this provider and its children components.
   * By default this is selected based on touch or mouse pointer type of the OS.
   */
  scale?: Scale,
  /**
   * Locale (language specific format) of this provider and its children.
   * Using the format primary-region, ex. en-US, fr-CA, ar-AE.
   * @default 'en-US'
   */
  locale?: string
}

export interface ProviderWrapperProps extends ProviderProps {
  /**
   * If this is the top level Provider for the application.
   */
  isTopLevel?: boolean
}

export interface ProviderContext extends ContextProps {
  version: string,
  theme: Theme,
  colorScheme: ColorScheme,
  scale: Scale
}
