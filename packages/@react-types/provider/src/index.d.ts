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
  toastPlacement?: ToastPlacement,
  isQuiet?: boolean,
  isEmphasized?: boolean,
  isDisabled?: boolean,
  isRequired?: boolean,
  isReadOnly?: boolean,
  validationState?: ValidationState
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
