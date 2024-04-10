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

import {DOMProps, Href, RouterOptions, StyleProps, ValidationState} from '@react-types/shared';
import {ReactNode} from 'react';

export type ColorScheme = 'light' | 'dark';
export type Scale = 'medium' | 'large';
export interface Breakpoints {
  S?: number,
  M?: number,
  L?: number,
  // Currently, it only deals with pixels, but we need to fix it to accept em or rem as well.
  [custom: string]: number | undefined
}

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
  /** Whether descendants should be displayed with the quiet style. */
  isQuiet?: boolean,
  /** Whether descendants should be displayed with the emphasized style. */
  isEmphasized?: boolean,
  /** Whether descendants should be disabled. */
  isDisabled?: boolean,
  /** Whether descendants should be displayed with the required style. */
  isRequired?: boolean,
  /** Whether descendants should be read only. */
  isReadOnly?: boolean,
  /** Whether descendants should be displayed with the validation state style. */
  validationState?: ValidationState
}

interface Router {
  navigate: (path: string, routerOptions: RouterOptions | undefined) => void,
  useHref?: (href: Href) => string
}

export interface ProviderProps extends ContextProps, DOMProps, StyleProps {
  /** The content of the Provider. */
  children: ReactNode,
  /**
   * The theme for your application.
   */
  theme?: Theme,
  /**
   * The color scheme for your application.
   * Defaults to operating system preferences.
   */
  colorScheme?: ColorScheme,
  /**
   * The default color scheme if no operating system setting is available.
   * @default 'light'
   */
  defaultColorScheme?: ColorScheme,
  /**
   * Sets the scale for your applications. Defaults based on device pointer type.
   */
  scale?: Scale,
  /**
   * The locale for your application as a [BCP 47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code.
   * Defaults to the browser/OS language setting.
   * @default 'en-US'
   */
  locale?: string,
  /**
   * The breakpoints for styleProps.
   * Do not use `base` property.
   * @default {S:380,M:768,L:1024}
   */
  breakpoints?: Breakpoints,
  /**
   * Provides a client side router to all nested React Spectrum links to enable client side navigation.
   */
  router?: Router
}

export interface ProviderContext extends ContextProps {
  /**
   * The package version number of the nearest parent Provider.
   */
  version: string,
  /**
   * The theme of the nearest parent Provider.
   */
  theme: Theme,
  /**
   * The color scheme of the nearest parent Provider.
   */
  colorScheme: ColorScheme,
  /**
   * The scale of the nearest parent Provider.
   */
  scale: Scale,
  /**
   * The breakpoints of the nearest parent Provider used for styleProps.
   */
  breakpoints: Breakpoints
}
